package com.e105.majoong.finance.service;

import com.e105.majoong.common.utils.S3Uploader;
import com.e105.majoong.finance.dto.out.CreateAccountResponseDto;
import com.e105.majoong.finance.dto.out.FinMemberResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Service
public class FinApiServiceImpl implements FinApiService {

    private final WebClient webClient;

    @Value("${finapi.base-url}")
    private String baseUrl;
    @Value("${finapi.api-key}")
    private String apiKey;
    @Value("${finapi.institution-code}")
    private String institutionCode;
    @Value("${finapi.fintech-app-no}")
    private String fintechAppNo;
    @Value("${finapi.account-type-unique-no}")
    private String accountTypeUniqueNo;

    public FinApiServiceImpl(@Qualifier("finWebClient") WebClient webClient,
                             ObjectMapper mapper, S3Uploader s3Uploader) {
        this.webClient = webClient;
    }

    public FinMemberResponseDto registerMember(String email) {
        Map<String, Object> req = Map.of(
                "apiKey", apiKey,
                "userId", email
        );

        return webClient.post()
                .uri(baseUrl + "/member")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .exchangeToMono(response -> {
                    if (response.statusCode().isError()) {
                        return response.bodyToMono(String.class)
                                .flatMap(body -> {
                                    log.error("RegisterMember failed: status={}, body={}", response.statusCode(), body);
                                    return Mono.error(new RuntimeException("RegisterMember API error: " + body));
                                });
                    }
                    return response.bodyToMono(FinMemberResponseDto.class);
                })
                .block();

    }

    public CreateAccountResponseDto createDemandDepositAccount(String userKey) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String nowTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
        String uniqueNo = today + nowTime + String.format("%06d", (int)(Math.random() * 1000000));

        Map<String, Object> header = Map.of(
                "apiName", "createDemandDepositAccount",
                "transmissionDate", today,
                "transmissionTime", nowTime,
                "institutionCode", institutionCode,
                "fintechAppNo", fintechAppNo,
                "apiServiceCode", "createDemandDepositAccount",
                "institutionTransactionUniqueNo", uniqueNo,
                "apiKey", apiKey,
                "userKey", userKey
        );

        Map<String, Object> req = Map.of(
                "Header", header,
                "accountTypeUniqueNo", accountTypeUniqueNo
        );

        return webClient.post()
                .uri(baseUrl + "/edu/demandDeposit/createDemandDepositAccount")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .exchangeToMono(response -> {
                    if (response.statusCode().isError()) {
                        return response.bodyToMono(String.class)
                                .flatMap(body -> {
                                    log.error("CreateAccount failed: status={}, body={}", response.statusCode(), body);
                                    return Mono.error(new RuntimeException("CreateAccount API error: " + body));
                                });
                    }
                    return response.bodyToMono(CreateAccountResponseDto.class);
                })
                .block();
    }
}