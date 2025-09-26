package com.e105.majoong.ai;

import reactor.core.publisher.Mono;

public interface OpenAIService {
    Mono<String> analyzeHorseImage(String type, String imageUrl);
    Mono<String> analyzeReport(String farmName, int year, int month, String content);
    Mono<String> generateThumbnail(String prompt);
}
