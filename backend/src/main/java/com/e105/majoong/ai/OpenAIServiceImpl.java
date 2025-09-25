package com.e105.majoong.ai;

import com.e105.majoong.common.utils.S3Uploader;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.Random;

@Service
@Slf4j
public class OpenAIServiceImpl implements OpenAIService {
    private final WebClient webClient;           // 텍스트 AI
    private final WebClient imageWebClient;      // 이미지 AI
    private final ObjectMapper mapper;
    private final S3Uploader s3Uploader;

    @Value("${openai.text-model}")
    private String textModel;

    @Value("${openai.urls.create-text-url}")
    private String textUrl;

    @Value("${openai.image-url}")
    private String imageUrl;

    @Value("${openai.image-base-url}")
    private String imageBaseUrl;

    @Value("${openai.api-key}")
    private String apiKey;

    public OpenAIServiceImpl(@Qualifier("openAiWebClient") WebClient webClient,
                             @Qualifier("openAiImageWebClient") WebClient imageWebClient,
                             ObjectMapper mapper,
                             S3Uploader s3Uploader) {
        this.webClient = webClient;
        this.imageWebClient = imageWebClient;
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

    private static final String REPORT_SYSTEM_PROMPT = """
            너는 주어진 데이터를 바탕으로 전문적인 '월간 목장 보고서'를 작성하는 AI 비서다.
            보고서는 지정된 형식과 규칙에 따라 명확하고 체계적으로 작성해야 한다.

            [입력 데이터 형식]
            - "말 이름: [이름]\\n내용: [요약]" 형식으로 된 말 상태 정보가 여러 개 제공된다.
            - "기부금 사용 내용: [요약]" 형식으로 된 영수증 정보가 여러 개 제공된다.
            - 각 데이터는 '---'로 구분되며, 말 정보와 기부금 정보는 '<<<<분석 데이터 구분선>>>>'으로 구분된다.

            [보고서 작성 규칙]
            1.  **보고서 제목**: "🐴 [농장 이름] [년]년 [월]월 월간 보고서" 형식으로 반드시 작성한다.
            2.  **구조화**: 보고서는 반드시 아래 7개의 목차와 '종합 평가'로 구성되어야 한다. 데이터가 없는 목차는 "해당 월의 특별한 기록이 없습니다."라고 간결하게 작성한다.
                - 1. 말 관리 현황
                - 2. 농장 환경 및 청결
                - 3. 사료 및 영양 관리
                - 4. 건강 관리
                - 5. 운동 및 훈련
                - 6. 시설 관리
                - 7. 향후 계획 (다음 달)
                - 📌 종합 평가
            3.  **내용 분류**:
                - "말 이름"이 명시된 데이터는 '1. 말 관리 현황'에 "[말 이름]: [내용 요약]" 형식으로 개별 항목을 작성한다. 관련된 내용은 '4. 건강 관리'나 '5. 운동 및 훈련'에도 종합적으로 서술할 수 있다.
                - "기부금 사용 내용" 데이터는 내용을 분석하여 '2. 농장 환경 및 청결', '3. 사료 및 영양 관리', '6. 시설 관리' 등 가장 적합한 목차에 분류하여 서술형으로 요약한다.
            4.  **추론 및 작성**:
                - '7. 향후 계획'은 입력된 데이터(부상 회복, 수술 후 관리, 계절 변화 등)를 바탕으로 합리적으로 추론하여 다음 달 계획을 2~3가지 작성한다.
                - '종합 평가'는 모든 내용을 아우르는 핵심적인 평가를 2~3문장으로 요약하여 작성한다.
            5.  **문체**: 간결하고 전문적인 '개조식'과 부드러운 '서술형' 문체를 혼합하여 사용한다.

            이제 아래의 농장 이름, 보고서 연월, 그리고 분석 데이터를 바탕으로 월간 보고서를 작성하라.
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

    @Override
    public Mono<String> analyzeReport(String farmName, int year, int month, String content) {
        String finalPrompt = String.format(
                "농장 이름: %s\n보고서 연월: %d년 %d월\n\n<<<<분석 데이터>>>>\n%s",
                farmName, year, month, content
        );

        var messages = mapper.createArrayNode();
        var systemMessage = mapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", REPORT_SYSTEM_PROMPT);
        messages.add(systemMessage);

        var userMessage = mapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", finalPrompt);
        messages.add(userMessage);

        var requestBody = mapper.createObjectNode();
        requestBody.put("model", textModel);
        requestBody.set("messages", messages);
        requestBody.put("max_tokens", 1024);
        requestBody.put("temperature", 0.3);

        return webClient.post()
                .uri(b -> b.path(textUrl).build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseFirstMessageText)
                .onErrorResume(e -> {
                    log.error("OpenAI API 호출 실패", e);
                    return Mono.just("월간 보고서 요약 중 오류가 발생했습니다: " + e.getMessage());
                });
    }

    @Override
    public Mono<String> generateThumbnail(String content) {
        String[] variations = {
                "Warm and friendly illustration of horses grazing peacefully on a meadow, with a stable in the background, soft pastel tones, 16:9 aspect ratio.",
                "Cozy farm illustration of horses grazing under warm sunlight, with a barn in the distance, flat 2D style, 16:9 aspect ratio.",
                "Friendly cartoon-like illustration of a horse farm, horses eating grass on a meadow, soft colors, 16:9 ratio.",
                "Peaceful illustration of a horse ranch at sunset, horses standing near a wooden fence, soft warm lighting, 16:9 aspect ratio.",
                "Bright and colorful flat illustration of horses playing in a green pasture, with a small barn and trees in the background, 16:9 aspect ratio.",
                "Minimalist 2D illustration of a farm landscape with horses grazing, rolling hills, and a stable, warm muted tones, 16:9 aspect ratio.",
                "Cartoon-style illustration of happy horses eating hay in front of a red barn, cheerful atmosphere, 16:9 ratio.",
                "Illustration of horses relaxing under a tree in a sunny meadow, friendly and simple flat design, 16:9 aspect ratio.",
                "Whimsical illustration of a horse ranch, soft watercolor-like tones, wide landscape with barn and stable, 16:9 aspect ratio.",
                "Playful 2D farm illustration with horses grazing near a wooden fence, pastel palette, calm and warm mood, 16:9 aspect ratio."
        };
        String basePrompt = variations[new Random().nextInt(variations.length)];
        String prompt = String.format("%s\nReport context: %s", basePrompt, shortenContent(content, 300));

        var requestBody = mapper.createObjectNode();
        var instances = mapper.createArrayNode();
        var instance = mapper.createObjectNode();
        instance.put("prompt", prompt);
        instances.add(instance);
        requestBody.set("instances", instances);
        var params = mapper.createObjectNode();
        params.put("sampleCount", 1);
        requestBody.set("parameters", params);

        String endpoint = String.format("%s%s?key=%s", imageBaseUrl, imageUrl, apiKey);

        return imageWebClient.post()
                .uri(endpoint)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(responseJson -> {
                    try {
                        var root = mapper.readTree(responseJson);
                        var predictions = root.path("predictions");
                        if (predictions.isArray() && predictions.size() > 0) {
                            String base64Image = predictions.get(0).path("bytesBase64Encoded").asText();
                            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
                            return s3Uploader.uploadByBytes(imageBytes, "thumbnail.png", "thumbnails", "image/png");
                        }
                        log.error("Imagen 응답에 predictions 없음: {}", responseJson);
                        return null;
                    } catch (Exception e) {
                        log.error("이미지 응답 파싱 실패", e);
                        return null;
                    }
                })
                .onErrorResume(e -> {
                    log.error("이미지 생성 실패", e);
                    return Mono.justOrEmpty((String) null);
                });
    }

    private String shortenContent(String content, int maxLength) {
        if (content == null) return "";
        return content.length() > maxLength ? content.substring(0, maxLength) + "..." : content;
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

    private String parseFirstMessageText(String json) {
        try {
            if (json == null) return "API로부터 응답이 없습니다.";
            var root = mapper.readTree(json);
            if (root.has("error")) {
                String errorMessage = root.path("error").path("message").asText("알 수 없는 오류");
                log.error("OpenAI API 에러: {}", errorMessage);
                return "보고서 생성 중 API 오류가 발생했습니다: " + errorMessage;
            }
            var choice0 = root.path("choices").get(0);
            return choice0.path("message").path("content").asText("내용을 요약하지 못했습니다.");
        } catch (Exception e) {
            log.error("OpenAI 응답 파싱 실패. Raw JSON: {}", json, e);
            return "응답 내용을 파싱하는 데 실패했습니다.";
        }
    }
}