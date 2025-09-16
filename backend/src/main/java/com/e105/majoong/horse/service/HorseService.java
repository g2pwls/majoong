package com.e105.majoong.horse.service;

import com.e105.majoong.horse.dto.out.HorseSearchResponseDto;
import org.springframework.data.domain.Page;

public interface HorseService {
    Page<HorseSearchResponseDto> searchHorses(String horseName, int page, int size);
}

