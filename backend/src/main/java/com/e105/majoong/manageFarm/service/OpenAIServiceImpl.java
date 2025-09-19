package com.e105.majoong.manageFarm.service;

import com.e105.majoong.common.utils.S3Uploader;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import java.time.Duration;
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
    private final S3Uploader s3Uploader;

    @Value("${openai.text-model}")
    private String textModel;

    @Value("${openai.urls.create-text-url}")
    private String textUrl;

    public OpenAIServiceImpl(@Qualifier("openAiWebClient") WebClient webClient,
                             ObjectMapper mapper, S3Uploader s3Uploader) {
        this.webClient = webClient;
        this.mapper = mapper;
        this.s3Uploader = s3Uploader;
    }

    private static final String SYSTEM_PROMPT = """
            너는 말 전문 수의사다. 입력은 사진 1장이다. 사진 종류(정면, 좌측, 우측, 마구간)에 따라 평가 기준이 다르다.
                    
            [평가 지침]
            - 정면 사진: 얼굴, 전신 균형, 체중(BCS), 전방 부상 중심으로 평가. 문장 시작은 '정면:'으로.
            - 좌측 사진: 왼쪽 몸통 근육 발달, 좌측 발굽 상태, 털/피부 이상 평가. 시작 문장 '좌측:'.
            - 우측 사진: 오른쪽 몸통 근육 발달, 우측 발굽 상태, 움직임 영향 요소 평가. 시작 문장 '우측:'.
            - 마구간 사진: 말 상태 언급 금지, 환경·위생 평가(바닥, 깔짚, 환기, 급수/사료). 시작 문장 '마구간:'.
                    
            [출력 규칙]
            - 각 사진별 2~3문장, 약 120자 내외로 작성.
            - 불필요한 서론/중복/추측 금지.
            - 사진에서 확인이 어려워도 관찰 가능한 정보와 일반적인 말 체형/건강 기준을 참고해 추정.
            - 문장 표현 다양화: '관찰됨', '확인됨', '보임', '양호함' 등을 적절히 사용.
            """;

    @Override
    public Mono<String> analyzeHorseImage(String type, String imageUrl) {
        var messages = mapper.createArrayNode();

        var systemMessage = mapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", SYSTEM_PROMPT);
        messages.add(systemMessage);

        var userMessage = mapper.createObjectNode();
        userMessage.put("role", "user");
        var userContent = mapper.createArrayNode();
        userContent.addObject()
                .put("type", "text")
                .put("text", type + " 사진을 평가해줘");

        /*객체 형태로 전달
         * url : 분석할 이미지 url
         * detail: 분석할 수준을 지정하는 것 ("auto-자동으로 적절한 분석 수준 결정)
         */
        var imageObj = mapper.createObjectNode()
                .put("url", imageUrl)
                .put("detail", "auto");
        userContent.addObject()
                .put("type", "image_url")
                .set("image_url", imageObj);

        userMessage.set("content", userContent);
        messages.add(userMessage);

        var requestBody = mapper.createObjectNode();
        requestBody.put("model", textModel);
        requestBody.set("messages", messages);
        requestBody.put("max_tokens", 120);
        requestBody.put("temperature", 0.2);

        return webClient.post()
                .uri(b -> b.path(textUrl).build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::firstMessageText)
                .onErrorResume(e -> {
                    log.error("OpenAI API 호출 실패", e);
                    return Mono.just("분석 중 오류가 발생했습니다.");
                });
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
