package com.e105.majoong.manageFarm.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeoCoding {
    @Value("${kakao.MapApi}")
    private String apiKey;

    private final HttpClient httpClient;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String KAKAO_ENDPOINT =  "https://dapi.kakao.com/v2/local/search/address.json?query=";
    public double[] getCoordinates(String address) {
        String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(KAKAO_ENDPOINT + encodedAddress))
                .GET()
                .timeout(Duration.ofSeconds(5))
                .header("Authorization", "KakaoAK " + apiKey)
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new IllegalStateException("Kakao API status=" + response.statusCode()
                                                + ", body=" + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode docs = root.path("documents");
            if (!docs.isArray() || docs.isEmpty()) {
                return null;
            }

            JsonNode info = docs.get(0);

            //x: 경도, y: 위도
            double longitude= info.path("x").asDouble();
            double latitude = info.path("y").asDouble();

            //위도, 경도
            return new double[]{latitude, longitude};

        } catch (InterruptedException e) {
            // 인터럽트 상태 복구 후 런타임 예외로 변환
            Thread.currentThread().interrupt();
            throw new IllegalStateException("HTTP 호출이 인터럽트되었습니다.", e);

        } catch (IOException e) {
            // 네트워크/IO 문제 → 런타임 예외로 변환
            throw new IllegalStateException("카카오 주소변환 API 호출 실패", e);
        }
    }
}
