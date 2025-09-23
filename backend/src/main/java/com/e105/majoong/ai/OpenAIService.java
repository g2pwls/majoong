package com.e105.majoong.ai;

import reactor.core.publisher.Mono;

//todo: 추후 batch 서비스로 분리
public interface OpenAIService {
    Mono<String> analyzeHorseImage(String type, String imageUrl);
    String analyzeReport(String farmName, int year, int month, String content);
}
