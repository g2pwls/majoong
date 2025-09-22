package com.e105.majoong.finance.service;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import com.e105.majoong.common.utils.S3Uploader;
import com.e105.majoong.finance.dto.out.CreateAccountResponseDto;
import com.e105.majoong.finance.dto.out.FinMemberResponseDto;
import com.e105.majoong.mypage.dto.out.AccountHistoryResponseDto;
import com.e105.majoong.mypage.dto.out.TransactionHistoryResponse;
import com.e105.majoong.withdraw.dto.in.WithdrawRequestDto;
import com.e105.majoong.withdraw.dto.out.WithdrawResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class FinApiServiceImpl implements FinApiService {

    private final WebClient webClient;
    private final WebClient finWebClient;
    private final FarmerRepository farmerRepository;

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
    @Value("${finapi.admin-account-no}")
    private String adminAccountNo;
    @Value("${finapi.admin-user-key}")
    private String adminUserKey;

    public FinApiServiceImpl(@Qualifier("finWebClient") WebClient webClient,
                             ObjectMapper mapper,
                             S3Uploader s3Uploader,
                             WebClient finWebClient,
                             FarmerRepository farmerRepository) {
        this.webClient = webClient;
        this.finWebClient = finWebClient;
        this.farmerRepository = farmerRepository;
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

    public WithdrawResponseDto withdraw(String memberUuid, WithdrawRequestDto dto) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String nowTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
        String uniqueNo = today + nowTime + String.format("%06d", (int)(Math.random() * 1000000));

        Farmer farmer = farmerRepository.findByMemberUuid(memberUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));

        String withdrawalAccountNo = farmer.getAccountNo();
        log.info("withdrawalAccountNo={}", withdrawalAccountNo);

        Map<String, Object> header = Map.of(
                "apiName", "updateDemandDepositAccountTransfer",
                "transmissionDate", today,
                "transmissionTime", nowTime,
                "institutionCode", institutionCode,
                "fintechAppNo", fintechAppNo,
                "apiServiceCode", "updateDemandDepositAccountTransfer",
                "institutionTransactionUniqueNo", uniqueNo,
                "apiKey", apiKey,
                "userKey", adminUserKey
        );

        Map<String, Object> req = Map.of(
                "Header", header,
                "depositAccountNo", withdrawalAccountNo,
                "depositTransactionSummary", "(수시입출금) : 입금(이체)",
                "transactionBalance", dto.getMoney(),
                "withdrawalAccountNo", adminAccountNo,
                "withdrawalTransactionSummary", "(수시입출금) : 출금(이체)"
        );

        return webClient.post()
                .uri(baseUrl + "/edu/demandDeposit/updateDemandDepositAccountTransfer")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .exchangeToMono(response -> {
                    if (response.statusCode().isError()) {
                        return response.bodyToMono(String.class)
                                .flatMap(body -> {
                                    log.error("Withdraw failed: status={}, body={}", response.statusCode(), body);
                                    return Mono.error(new RuntimeException("Withdraw API error: " + body));
                                });
                    }

                    return response.bodyToMono(Map.class)
                            .map(WithdrawResponseDto::from);
                })
                .block();
    }

    public AccountHistoryResponseDto inquireTransactionHistoryList(String memberUuid) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String fiveYearsAgo = LocalDate.now().minusYears(5).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String nowTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
        String uniqueNo = today + nowTime + String.format("%06d", (int)(Math.random() * 1000000));

        Farmer farmer = farmerRepository.findByMemberUuid(memberUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));

        String accountNo = farmer.getAccountNo();
        log.info("inquireTransactionHistoryList: accountNo={}", accountNo);

        Map<String, Object> header = Map.of(
                "apiName", "inquireTransactionHistoryList",
                "transmissionDate", today,
                "transmissionTime", nowTime,
                "institutionCode", institutionCode,
                "fintechAppNo", fintechAppNo,
                "apiServiceCode", "inquireTransactionHistoryList",
                "institutionTransactionUniqueNo", uniqueNo,
                "apiKey", apiKey,
                "userKey", farmer.getUserKey()
        );

        Map<String, Object> req = Map.of(
                "Header", header,
                "accountNo", accountNo,
                "startDate", fiveYearsAgo,
                "endDate", today,
                "transactionType", "M",
                "orderByType", "ASC"
        );

        TransactionHistoryResponse response = webClient.post()
                .uri(baseUrl + "/edu/demandDeposit/inquireTransactionHistoryList")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .exchangeToMono(res -> {
                    if (res.statusCode().isError()) {
                        return res.bodyToMono(String.class)
                                .flatMap(body -> {
                                    log.error("inquireTransactionHistoryList failed: status={}, body={}",
                                            res.statusCode(), body);
                                    return Mono.error(new RuntimeException("API error: " + body));
                                });
                    }
                    return res.bodyToMono(TransactionHistoryResponse.class);
                })
                .block();

        if (response == null || response.getREC() == null) {
            throw new BaseException(BaseResponseStatus.NO_EXIST_MY_ACCOUNT_TRANSACTION);
        }

        List<TransactionHistoryResponse.Transaction> txList = response.getREC().getList();

        List<AccountHistoryResponseDto.TransactionDto> transactions = txList.stream()
                .map(tx -> new AccountHistoryResponseDto.TransactionDto(
                        tx.getTransactionDate(),
                        tx.getTransactionTime(),
                        tx.getTransactionBalance(),
                        tx.getTransactionAfterBalance()
                ))
                .toList();


        String latestBalance = transactions.isEmpty() ? "0" : transactions.get(transactions.size() - 1).getAfterBalance();

        return new AccountHistoryResponseDto(latestBalance, transactions);
    }

}