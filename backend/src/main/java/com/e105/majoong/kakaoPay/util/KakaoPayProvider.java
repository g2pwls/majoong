package com.e105.majoong.kakaoPay.util;

import com.e105.majoong.kakaoPay.dto.in.OrderRequestDto;
import com.e105.majoong.kakaoPay.dto.out.ApproveResponse;
import com.e105.majoong.kakaoPay.dto.out.ReadyResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Component
@Transactional
@RequiredArgsConstructor
public class KakaoPayProvider {

    @Value("${kakaopay.secretKey}")
    private String secretKey;

    @Value("${kakaopay.cid}")
    private String cid;

    public ReadyResponse ready(OrderRequestDto request) {
        MultiValueMap<String, String> parameters = new LinkedMultiValueMap<>();

        parameters.add("cid", cid);
        parameters.add("partner_order_id", "1234567890");
        parameters.add("partner_user_id", "1234567890");
        parameters.add("item_name", request.getItemName());
        parameters.add("quantity", request.getQuantity());
        parameters.add("total_amount", request.getTotalPrice());
        parameters.add("tax_free_amount", "0");
        parameters.add("approval_url", "http://localhost:8080/api/v1/kakao-pay/approve");
        parameters.add("cancel_url", "http://localhost:8080/api/v1/kakao-pay/cancel");
        parameters.add("fail_url", "http://localhost:8080/kakao-pay/fail");

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(parameters, getHeaders());

        RestTemplate restTemplate = new RestTemplate();
        String url = "https://open-api.kakaopay.com/online/v1/payment/ready";

        ResponseEntity<ReadyResponse> response = restTemplate.postForEntity(url, entity, ReadyResponse.class);

        SessionProvider.addAttribute("tid",
                Objects.requireNonNull(response.getBody()).getTid());

        return response.getBody();
    }

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "SECRET_KEY " + secretKey);
        headers.add("Content-type", "application/json");
        return headers;
    }

    public ApproveResponse approve(String pgToken) {
        Map<String, String> parameters = new HashMap<>();
        parameters.put("cid", cid);
        parameters.put("tid", SessionProvider.getStringAttribute("tid"));
        parameters.put("partner_order_id", "1234567890");
        parameters.put("partner_user_id", "1234567890");
        parameters.put("pg_token", pgToken); // 결제승인 요청을 인증하는 토큰

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(parameters, getHeaders());

        RestTemplate restTemplate = new RestTemplate();
        String url = "https://open-api.kakaopay.com/online/v1/payment/approve";
        ResponseEntity<ApproveResponse> response = restTemplate.postForEntity(url, entity, ApproveResponse.class);

        return response.getBody();
    }
}