package com.e105.majoong.farm.service;

import com.e105.majoong.farm.dto.out.FarmListResponseDto;
import org.springframework.data.domain.Page;

public interface FarmService {
    Page<FarmListResponseDto> searchFarms(String farmName, int page, int size, String memberUuid);
}

