package com.e105.majoong.member.service;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.member.dto.in.VerificationRequestDto;
import com.e105.majoong.member.dto.out.VerificationResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    @Value("${verification.api.key}")
    private String serviceKey;

    private final OkHttpClient client = new OkHttpClient();

    public VerificationResponseDto verify(VerificationRequestDto req) {
        try {
            JSONObject biz = new JSONObject();
            biz.put("b_no", req.getBusinessNum());
            biz.put("start_dt", req.getOpeningDate());
            biz.put("p_nm", req.getName());
            biz.put("p_nm2", "");
            biz.put("b_nm", req.getFarmName());
            biz.put("corp_no", "");
            biz.put("b_sector", "");
            biz.put("b_type", "");

            JSONArray businesses = new JSONArray();
            businesses.add(biz);

            JSONObject bodyJson = new JSONObject();
            bodyJson.put("businesses", businesses);

            RequestBody body = RequestBody.create(
                    bodyJson.toString(),
                    MediaType.parse("application/json; charset=UTF-8")
            );

            String encodedKey = URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);
            String url = "https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=" + encodedKey;

            Request request = new Request.Builder()
                    .url(url)
                    .post(body)
                    .addHeader("Content-Type", "application/json; charset=UTF-8")
                    .addHeader("Accept", "application/json")
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    log.error("API 호출 실패: {}", response);
                    throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
                }

                String responseBody = response.body().string();
                log.info("응답: {}", responseBody);

                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> map = mapper.readValue(responseBody, Map.class);

                boolean verified = false;
                List<Map<String, Object>> data = (List<Map<String, Object>>) map.get("data");
                if (data != null && !data.isEmpty()) {
                    String valid = (String) data.get(0).get("valid");
                    verified = "01".equals(valid);
                }

                return new VerificationResponseDto(verified);
            }

        } catch (Exception e) {
            log.error("사업자 검증 실패", e);
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }
    }
}
