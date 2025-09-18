package com.e105.majoong.finance.dto.out;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;

@Getter
@Data
public class CreateAccountResponseDto {
    private Header Header;

    @JsonProperty("REC")
    private Rec rec;

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
        private String bankCode;
        private String accountNo;
        private Currency currency;
    }

    @Data
    public static class Currency {
        private String currency;
        private String currencyName;
    }
}
