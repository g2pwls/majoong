package com.e105.majoong.farm.service;

import com.e105.majoong.farm.dto.out.HorseSearchResponseDto;
import org.springframework.data.domain.Page;

public interface HorseService {
    Page<HorseSearchResponseDto> searchHorses(String horseName, int page, int size);
}

