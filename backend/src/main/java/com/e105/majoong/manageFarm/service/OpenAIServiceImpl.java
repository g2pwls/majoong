package com.e105.majoong.manageFarm.service;

import com.e105.majoong.manageFarm.dto.out.HorseImageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class OpenAIServiceImpl implements OpenAIService {
    private final WebClient webClient;
    private final ObjectMapper mapper;

    @Value("${openai.text-model}")
    private String textModel;

    @Value("${openai.urls.create-text-url}")
    private String textUrl;

    public OpenAIServiceImpl(@Qualifier("openAiWebClient") WebClient webClient,
                             ObjectMapper mapper) {
        this.webClient = webClient;
        this.mapper = mapper;
    }

    private static final String HORSE_SYSTEM_PROMPT = """
            너는 말 전문 수의사야.
            제공된 사진을 기반으로 다음을 평가해줘:
            1. 전면, 좌측 측면, 우측 측면 이미지를 분석하여  
               - 체형  
               - 보이는 부상  
               - 발굽 상태  
               - 털과 피부 병변  
               - 체중/체형 점수(BCS)  
            2. 마구간 이미지를 분석하여  
               - 위생 상태  

            답변은 약 900자 분량의 한국어 텍스트로, 정확하고 구조적으로 작성해줘.
            """;

    @Override
    public Mono<String> analyzeHorseImages(HorseImageDto dto) {
        var messages = mapper.createArrayNode();

        var systemMessage = mapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", HORSE_SYSTEM_PROMPT);
        messages.add(systemMessage);

        var userMessage = mapper.createObjectNode();
        userMessage.put("role", "user");
        var userContent = mapper.createArrayNode();
        userContent.addObject()
                .put("type", "text")
                .put("text", "다음 말과 마구간 이미지를 분석해줘");
        addImage(userContent, dto.getFrontImage());
        addImage(userContent, dto.getLeftSideImage());
        addImage(userContent, dto.getRightSideImage());
        addImage(userContent, dto.getStableImage());

        userMessage.set("content", userContent);
        messages.add(userMessage);

        var requestBody = mapper.createObjectNode();
        requestBody.put("model", textModel);
        requestBody.set("messages", messages);

        return webClient.post()
                .uri(textUrl)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::firstMessageText)
                .onErrorResume(e -> {
                    log.error("OpenAI API 호출 실패", e);
                    return Mono.just("분석 중 오류가 발생했습니다.");
                });

    }

    private void addImage(ArrayNode content, String url) {
        if (url == null || url.isBlank()) {
            return;
        }
        var node = mapper.createObjectNode();
        node.put("type", "image_url");
        node.set("image_url", mapper.createObjectNode().put("url", url));
        content.add(node);
    }

    private String firstMessageText(String json) {
        try {
            var root = mapper.readTree(json);
            var choice0 = root.path("choices").get(0);
            return choice0.path("message").path("content").asText("");
        } catch (Exception e) {
            return "";
        }
    }
}
