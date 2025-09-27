package com.e105.majoong.farm.service;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.horse.Horse;
import com.e105.majoong.common.model.horse.HorseRepository;
import com.e105.majoong.common.model.horseState.HorseState;
import com.e105.majoong.common.model.horseState.HorseStateRepository;
import com.e105.majoong.farm.dto.out.HorseDetailResponseDto;
import com.e105.majoong.farm.dto.out.HorseSearchResponseDto;
import com.e105.majoong.farm.dto.out.HorseWeeklyReportDetailResponseDto;
import com.e105.majoong.farm.dto.out.HorseWeeklyReportDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HorseServiceImpl implements HorseService {

    private final HorseRepository horseRepository;
    private final HorseStateRepository horseStateRepository;

    @Override
    public Page<HorseSearchResponseDto> searchHorses(String horseName, int page, int size) {
        Page<Horse> horses;

        if (horseName == null || horseName.isBlank()) {
            horses = horseRepository.findByDeletedAtIsNull(PageRequest.of(page, size));
        } else {
            horses = horseRepository.findByHorseNameContainingAndDeletedAtIsNull(horseName, PageRequest.of(page, size));
        }

        return horses.map(HorseSearchResponseDto::toDto);
    }

    @Override
    public HorseDetailResponseDto getHorseDetail(String farmUuid, String horseNumber, Integer year, Integer month) {
        LocalDate now = LocalDate.now();
        int targetYear = (year != null) ? year : now.getYear();
        int targetMonth = (month != null) ? month : now.getMonthValue();

        Horse horse = horseRepository.findByHorseNumberAndFarm_FarmUuid(horseNumber, farmUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_HORSE));

        LocalDateTime start = LocalDate.of(targetYear, targetMonth, 1).atStartOfDay();
        LocalDateTime end = start.withDayOfMonth(start.toLocalDate().lengthOfMonth()).toLocalDate().atTime(LocalTime.MAX);

        List<HorseState> reports = horseStateRepository.findByHorseAndFarmAndPeriod(
                horseNumber, farmUuid, start, end
        );

        List<HorseWeeklyReportDto> weeklyReports = reports.stream()
                .map(r -> HorseWeeklyReportDto.builder()
                        .horseReportId(r.getId())
                        .frontImageUrl(r.getFrontImage())
                        .month(r.getUploadedAt().getMonthValue())
                        .week((r.getUploadedAt().getDayOfMonth() - 1) / 7 + 1) // 주차 계산 (1일부터 시작)
                        .aiSummary(r.getAiSummary())
                        .uploadedAt(r.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        return HorseDetailResponseDto.toDto(horse, weeklyReports);
    }

    @Override
    public HorseWeeklyReportDetailResponseDto getWeeklyReportDetail(String horseNumber, Long horseStateId) {
        HorseState state = horseStateRepository.findByIdAndHorseNumber(horseStateId, horseNumber)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_HORSE_STATE));

        return HorseWeeklyReportDetailResponseDto.toDto(state);
    }
}
