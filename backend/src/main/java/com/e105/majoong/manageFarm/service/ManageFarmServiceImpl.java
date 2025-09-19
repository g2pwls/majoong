package com.e105.majoong.manageFarm.service;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.common.model.horse.Horse;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.horseState.HorseState;
import com.e105.majoong.common.model.horseState.HorseStateRepository;
import com.e105.majoong.common.utils.S3Uploader;
import com.e105.majoong.manageFarm.dto.in.FarmInfoCreateDto;
import com.e105.majoong.manageFarm.dto.in.HorseInfoUpdateDto;
import com.e105.majoong.manageFarm.dto.in.ReportHorseStatusDto;
import com.e105.majoong.manageFarm.dto.out.GeoDto;
import com.e105.majoong.manageFarm.dto.out.HorseListResponseDto;
import com.e105.majoong.common.model.horse.HorseRepository;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@Slf4j
@RequiredArgsConstructor
public class ManageFarmServiceImpl implements ManageFarmService {

    private final GeoCoding geoCoding;
    private final FarmerRepository farmerRepository;
    private final FarmRepository farmRepository;
    private final HorseRepository horseRepository;
    private final S3Uploader s3Uploader;
    private final HorseStateRepository horseStateRepository;
    private final TransactionTemplate txTemplate;
    //test
    private final OpenAIService openAIService;

    private static final String FARM_IMAGE_DIR = "farm";
    private static final String HORSE_IMAGE_DIR = "horse/profile";
    private static final String HORSE_STATE_DIR = "horse/state";

    @Override
    public String updateFarm(String memberUuid, FarmInfoCreateDto updateDto) {
        Farmer farmer = farmerRepository.findByMemberUuid(memberUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_USER));

        double[] geo = geoCoding.getCoordinates(updateDto.getAddress());
        double latitude = geo[0];
        double longitude = geo[1];
        try {
            String imageUrl = s3Uploader.upload(updateDto.getProfileImage(), FARM_IMAGE_DIR);
            Farm farm = farmRepository.save(updateDto.toEntity(farmer, latitude, longitude, imageUrl));
            return farm.getFarmUuid();
        } catch (IOException e) {
            throw new BaseException(BaseResponseStatus.S3_UPLOAD_FAILED);
        }
    }

    @Override
    public void updateHorse(String memberUuid, HorseInfoUpdateDto updateDto) {
        Farm farm = farmRepository.findByFarmUuid(updateDto.getFarmUuid()).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        try {
            String imageUrl = s3Uploader.upload(updateDto.getProfileImage(), HORSE_IMAGE_DIR);
            horseRepository.save(updateDto.toEntity(farm, imageUrl));

        } catch (IOException e) {
            throw new BaseException(BaseResponseStatus.S3_UPLOAD_FAILED);
        }
    }

    @Override
    public List<HorseListResponseDto> getHorseList(String memberUuid, String farmUuid) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        if (!farm.getMemberUuid().equals(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
        }
        List<Horse> horses = horseRepository.findByFarm(farm);
        return horses.stream().map(HorseListResponseDto::toDto).toList();
    }

    @Override
    public GeoDto getGeo(String farmUuid) {
        Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
        return GeoDto.toDto(farm);
    }

    /*
     * 말 사진 한장 처리 결과를 담는 곳
     * slot은 사진 종류(정면, 좌측, 우측, 마구간)
     * url은 S3 업로드 후 URL
     * summary는 AI 분석 결과
     */
    record ImgResult(String slot, String url, String summary) {
    }

    @Override
    public Mono<String> reportHorseState(String memberUuid, String farmUuid, Long horseNumber,
                                         ReportHorseStatusDto dto) {
        /*
         * 블로킹 코드를 비동기로 실행(블로킹 코드: 이 요청을 처리하기 위해 현재 작업을 차단하는 코드)
         * subscribeOn(Schedulers.boundedElastic())는 블로킹 코드를 별도의 스레드 풀에서 실행
         * */
        Mono<Farm> farmMono = Mono.fromCallable(() -> {
            Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                    () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
            if (!farm.getMemberUuid().equals(memberUuid)) {
                throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
            }
            if (!horseRepository.existsByHorseNumber(horseNumber)) {
                throw new BaseException(BaseResponseStatus.NO_EXIST_HORSE);
            }
            return farm;
        }).subscribeOn(Schedulers.boundedElastic());

        /*
         * mono 결과로 farm을 받아서 이미지 업로드 및 ai 분석 mono 생성
         * 각 과정을 병렬로 처리
         * */
        return farmMono.flatMap(farm -> {
            /*
             * 각 이미지별 S3 업로드와 AI 분석 mono 생성
             * */
            Mono<ImgResult> front = processOne("정면", dto.getFrontImage());
            Mono<ImgResult> left = processOne("좌측", dto.getLeftSideImage());
            Mono<ImgResult> right = processOne("우측", dto.getRightSideImage());
            Mono<ImgResult> stable = processOne("마구간", dto.getStableImage());
            /*
             * mono.zip으로 여러 mono 병렬 실행(front, left, right, stable 동시 실행)
             * */
            return Mono.zip(front, left, right, stable)
                    .flatMap(t -> {
                        ImgResult f = t.getT1(), l = t.getT2(), r = t.getT3(), s = t.getT4();
                        /*
                         * ai 분석 결과를 합치기
                         * */
                        String aiSummary = Stream.of(f, l, r, s)
                                .map(ImgResult::summary).filter(Objects::nonNull)
                                .collect(Collectors.joining("\n"));

                        // DB 저장은 짧게
                        return Mono.fromCallable(() ->
                                txTemplate.execute(status -> {
                                    HorseState state = dto.toEntity(
                                            farmUuid, memberUuid, horseNumber,
                                            f.url(), l.url(), r.url(), s.url(), aiSummary
                                    );
                                    horseStateRepository.save(state);
                                    return aiSummary;
                                })
                        ).subscribeOn(Schedulers.boundedElastic());
                    });
        }).onErrorResume(e ->
                Mono.error(e instanceof BaseException ? e :
                        new BaseException(BaseResponseStatus.FARM_STATE_UPLOAD_ERROR))
        );
    }

    private Mono<ImgResult> processOne(String slot, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Mono.just(new ImgResult(slot, null, ""));
        }
        //multipartFile 읽어서 byte 배열로 변환
        Mono<byte[]> bytesMono = Mono.fromCallable(file::getBytes)
                .subscribeOn(Schedulers.boundedElastic())
                .cache();

        //byte 배열을 이용해 S3에 업로드 후 URL을 반환
        Mono<String> urlMono = bytesMono.flatMap(bytes -> {
            String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("unknown")
                    .replaceAll("\\s", "_");
            String contentType = Optional.ofNullable(file.getContentType()).orElse("application/octet-stream");
            return Mono.fromCallable(() -> s3Uploader.uploadByBytes(bytes, originalName, HORSE_STATE_DIR, contentType))
                    .subscribeOn(Schedulers.boundedElastic());
        });

        //AI 모델로 전달할 Data URI 생성
        Mono<String> dataUriMono = bytesMono.map(bytes -> {
            String mime = Optional.ofNullable(file.getContentType()).orElse("image/jpeg");
            String b64 = java.util.Base64.getEncoder().encodeToString(bytes);
            return "data:" + mime + ";base64," + b64;
        });

        //AI 분석 결과 텍스트 반환
        Mono<String> summaryMono = dataUriMono
                .flatMap(dataUri -> openAIService.analyzeHorseImage(slot, dataUri))
                .timeout(Duration.ofSeconds(18))
                .onErrorReturn("분석 실패");

        return Mono.zip(urlMono, summaryMono)
                .map(t -> new ImgResult(slot, t.getT1(), t.getT2()));
    }

}
