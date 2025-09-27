package com.e105.majoong.mypage.service;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.collection.CollectionCard;
import com.e105.majoong.common.model.collection.CollectionCardRepository;
import com.e105.majoong.common.model.collection.CollectionCardRepositoryCustom;
import com.e105.majoong.common.model.donator.DonatorRepository;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.horse.Horse;
import com.e105.majoong.common.model.horse.HorseRepository;
import com.e105.majoong.mypage.dto.in.DonatorCardCreateDto;
import com.e105.majoong.mypage.dto.out.CollectionResponseDto;
import com.e105.majoong.mypage.dto.out.HorseInFarmResponseDto;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DonatorCollectionServiceImpl implements DonatorCollectionService {
    private final DonatorRepository donatorRepository;
    private final HorseRepository horseRepository;
    private final FarmRepository farmRepository;
    private final CollectionCardRepository collectionRepository;
    private final CollectionCardRepositoryCustom collectionCardRepositoryCustom;

    @Override
    public List<HorseInFarmResponseDto> getHorsesByDonator(String memberUuid, String farmUuid) {
        if (!donatorRepository.existsByMemberUuid(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_DONATOR);
        }
        Farm farm = farmRepository.findByFarmUuid(farmUuid).orElseThrow(
                () -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));

        List<Horse> horses = horseRepository.findByFarmAndDeletedAtIsNull(farm);

        return horses.stream().map(horse -> HorseInFarmResponseDto.toDto(farm.getFarmName(), horse)).toList();
    }

    @Override
    public CollectionResponseDto getCollectionList(String memberUuid) {
        if (!donatorRepository.existsByMemberUuid(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_DONATOR);
        }
        List<HorseInFarmResponseDto> list = collectionCardRepositoryCustom.getCollectionList(memberUuid);
        return CollectionResponseDto.toDto(list.size(), list);
    }

    @Override
    public void createCollection(String memberUuid, DonatorCardCreateDto dto) {
        if (!donatorRepository.existsByMemberUuid(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_DONATOR);
        }
        collectionRepository.save(dto.toEntity(memberUuid));
    }
}
