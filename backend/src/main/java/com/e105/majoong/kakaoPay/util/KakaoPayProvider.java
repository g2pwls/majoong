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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

//... (import 구문은 기존과 동일)

@Slf4j
@Component
@Transactional
@RequiredArgsConstructor
public class KakaoPayProvider {

    @Value("${kakaopay.secretKey}")
    private String secretKey;

    @Value("${kakaopay.cid}")
    private String cid;

    @Value("${kakaopay.url.approve}")
    private String approveUrl;

    @Value("${kakaopay.url.cancel}")
    private String cancelUrl;

    @Value("${kakaopay.url.fail}")
    private String failUrl;

    @Value("${kakaopay.url.ready}")
    private String readyUrl;

    @Value("${kakaopay.url.approveRedirect}")
    private String approveRedirect;

    public ReadyResponse ready(OrderRequestDto request) {

        Map<String, String> parameters = new HashMap<>();

        parameters.put("cid", cid);
        parameters.put("partner_order_id", "1234567890");
        parameters.put("partner_user_id", "1234567890");
        parameters.put("item_name", request.getItemName());
        parameters.put("quantity", request.getQuantity());
        parameters.put("total_amount", request.getTotalPrice());
        parameters.put("tax_free_amount", "0");
        parameters.put("approval_url", approveUrl);
        parameters.put("cancel_url", cancelUrl);
        parameters.put("fail_url", failUrl);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(parameters, getHeaders());

        RestTemplate restTemplate = new RestTemplate();
        String url = readyUrl;
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
        parameters.put("pg_token", pgToken);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(parameters, getHeaders());

        RestTemplate restTemplate = new RestTemplate();
        String url = approveRedirect;
        ResponseEntity<ApproveResponse> response = restTemplate.postForEntity(url, entity, ApproveResponse.class);

        return response.getBody();
    }
}