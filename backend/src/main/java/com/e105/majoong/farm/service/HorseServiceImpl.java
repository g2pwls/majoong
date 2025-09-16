package com.e105.majoong.farm.service;

import com.e105.majoong.common.domain.Horse;
import com.e105.majoong.farm.repository.HorseRepository;
import com.e105.majoong.farm.dto.out.HorseSearchResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HorseServiceImpl implements HorseService {

    private final HorseRepository horseRepository;

    @Override
    public Page<HorseSearchResponseDto> searchHorses(String horseName, int page, int size) {
        Page<Horse> horses;

        if (horseName == null || horseName.isBlank()) {
            horses = horseRepository.findAll(PageRequest.of(page, size));
        } else {
            horses = horseRepository.findByHorseNameContaining(horseName, PageRequest.of(page, size));
        }

        return horses.map(HorseSearchResponseDto::toDto);
    }
}
