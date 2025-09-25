package com.e105.majoong.kakaoPay.util;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.redis.RedisService;
import com.e105.majoong.kakaoPay.dto.in.OrderRequestDto;
import com.e105.majoong.kakaoPay.dto.out.ApproveResponseDto;
import com.e105.majoong.kakaoPay.dto.out.ReadyResponseDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
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

    private final RedisService redisService;

    private static final long TTL = 1000 * 60 * 5; // 5분

    /**
     * 카카오 결제 준비 (ready)
     */
    public ReadyResponseDto ready(OrderRequestDto request, String memberUuid) {

        Map<String, String> parameters = new HashMap<>();
        parameters.put("cid", cid);
        parameters.put("partner_order_id", request.getFarmUuid());
        parameters.put("partner_user_id", memberUuid);
        parameters.put("item_name", "후원");
        parameters.put("quantity", "1");
        parameters.put("total_amount", request.getTotalPrice());
        parameters.put("tax_free_amount", "0");
        parameters.put("approval_url", approveUrl);
        parameters.put("cancel_url", cancelUrl);
        parameters.put("fail_url", failUrl);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(parameters, getHeaders());
        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<ReadyResponseDto> response =
                restTemplate.postForEntity(readyUrl, entity, ReadyResponseDto.class);

        ReadyResponseDto body = Objects.requireNonNull(response.getBody());

        String tid = body.getTid();

        // ✅ Redis 저장
        redisService.set("kakao:tid:" + memberUuid, tid, TTL); // memberUuid -> tid
        redisService.set("kakao:partner_order_id:" + tid, request.getFarmUuid(), TTL);
        redisService.set("kakao:partner_user_id:" + tid, memberUuid, TTL);

        log.info("카카오페이 ready 완료 - memberUuid={}, tid={}", memberUuid, tid);

        return body;
    }

    /**
     * 카카오 결제 승인 (approve)
     */
    public ApproveResponseDto approve(String pgToken, String memberUuid) {
        log.info("Kakao approve 호출: pgToken={}, memberUuid={}", pgToken, memberUuid);

        // 1) memberUuid로 tid 조회
        String tid = (String) redisService.get("kakao:tid:" + memberUuid);
        if (tid == null) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
        }

        // 2) tid 기반으로 다른 값 조회
        String partnerOrderId = (String) redisService.get("kakao:partner_order_id:" + tid);
        String partnerUserId = (String) redisService.get("kakao:partner_user_id:" + tid);

        if (partnerOrderId == null || partnerUserId == null) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
        }

        Map<String, String> parameters = new HashMap<>();
        parameters.put("cid", cid);
        parameters.put("tid", tid);
        parameters.put("partner_order_id", partnerOrderId);
        parameters.put("partner_user_id", partnerUserId);
        parameters.put("pg_token", pgToken);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(parameters, getHeaders());
        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<ApproveResponseDto> response =
                restTemplate.postForEntity(approveRedirect, entity, ApproveResponseDto.class);

        // ✅ 승인 끝나면 Redis 값 삭제
        redisService.delete("kakao:tid:" + memberUuid);
        redisService.delete("kakao:partner_order_id:" + tid);
        redisService.delete("kakao:partner_user_id:" + tid);

        log.info("카카오페이 approve 완료 - memberUuid={}, tid={}", memberUuid, tid);

        return response.getBody();
    }

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "SECRET_KEY " + secretKey);
        headers.add("Content-type", "application/json");
        return headers;
    }
}