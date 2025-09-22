package com.e105.majoong.report.batch;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Slf4j
public class OpenAiServiceImpl implements OpenAiService {

    private final WebClient webClient;
    private final ObjectMapper mapper;

    @Value("${openai.text-model}")
    private String textModel;

    @Value("${openai.urls.create-text-url}")
    private String textUrl;

    public OpenAiServiceImpl(@Qualifier("openAiWebClient") WebClient webClient, ObjectMapper mapper) {
        this.webClient = webClient;
        this.mapper = mapper;
    }

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
    public String analyzeReport(String farmName, int year, int month, String content) {
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
        // -------------------------

        var requestBody = mapper.createObjectNode();
        requestBody.put("model", textModel);
        requestBody.set("messages", messages);
        requestBody.put("max_tokens", 1024);
        requestBody.put("temperature", 0.3);

        try {
            String responseJson = webClient.post()
                    .uri(b -> b.path(textUrl).build())
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseFirstMessageText(responseJson);

        } catch (Exception e) {
            log.error("OpenAI API 호출 실패", e);
            return "월간 보고서 요약 중 오류가 발생했습니다: " + e.getMessage();
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