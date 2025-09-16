package com.e105.majoong.farm.service;

import com.e105.majoong.common.domain.Farm;
import com.e105.majoong.farm.dto.out.FarmHorseResponseDto;
import com.e105.majoong.farm.dto.out.FarmListResponseDto;
import com.e105.majoong.farm.repository.BookmarkRepository;
import com.e105.majoong.farm.repository.FarmRepository;
import com.e105.majoong.farm.repository.HorseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final BookmarkRepository bookmarkRepository;
    private final HorseRepository horseRepository;

    @Override
    public Page<FarmListResponseDto> searchFarms(String farmName, int page, int size, String memberUuid) {
        Page<Farm> farms;

        if (farmName == null || farmName.isBlank()) {
            farms = farmRepository.findAll(PageRequest.of(page, size));
        } else {
            farms = farmRepository.findByFarmNameContaining(farmName, PageRequest.of(page, size));
        }

        return farms.map(farm -> {
            boolean isBookmark = bookmarkRepository.existsByMemberUuidAndFarmUuid(memberUuid, farm.getFarmUuid());

            List<FarmHorseResponseDto> horseList = horseRepository.findByFarm(farm).stream()
                    .map(FarmHorseResponseDto::toDto)
                    .collect(Collectors.toList());

            return FarmListResponseDto.toDto(farm, horseList, isBookmark);
        });
    }
}
