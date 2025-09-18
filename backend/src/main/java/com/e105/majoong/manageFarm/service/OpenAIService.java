package com.e105.majoong.manageFarm.service;

import com.e105.majoong.manageFarm.dto.out.HorseImageDto;
import java.util.List;
import reactor.core.publisher.Mono;

//todo: 추후 batch 서비스로 분리
public interface OpenAIService {
    Mono<String> analyzeHorseImages(HorseImageDto dto);
}
