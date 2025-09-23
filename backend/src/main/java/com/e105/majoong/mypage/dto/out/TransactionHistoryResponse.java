package com.e105.majoong.mypage.dto.out;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

// 외부 API 응답 매핑용
@Data
public class TransactionHistoryResponse {
    @JsonProperty("Header")
    private Header Header;
    @JsonProperty("REC")
    private Rec REC;

    @Data
    public static class Header {
        private String responseCode;
        private String responseMessage;
        private String apiName;
        private String transmissionDate;
        private String transmissionTime;
        private String institutionCode;
        private String apiKey;
        private String apiServiceCode;
        private String institutionTransactionUniqueNo;
    }

    @Data
    public static class Rec {
        private String totalCount;
        private List<Transaction> list;
    }

    @Data
    public static class Transaction {
        private String transactionUniqueNo;
        private String transactionDate;
        private String transactionTime;
        private String transactionType;
        private String transactionTypeName;
        private String transactionAccountNo;
        private String transactionBalance;
        private String transactionAfterBalance;
        private String transactionSummary;
        private String transactionMemo;
    }
}


