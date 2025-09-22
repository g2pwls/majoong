package com.e105.majoong.withdraw.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawResponseDto {
    private String responseCode;
    private String responseMessage;
    private List<Record> rec;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Record {
        private String transactionUniqueNo;
        private String accountNo;
        private String transactionDate;
        private String transactionType;
        private String transactionTypeName;
        private String transactionAccountNo;

        public static Record from(Map<String, Object> map) {
            return Record.builder()
                    .transactionUniqueNo((String) map.get("transactionUniqueNo"))
                    .accountNo((String) map.get("accountNo"))
                    .transactionDate((String) map.get("transactionDate"))
                    .transactionType((String) map.get("transactionType"))
                    .transactionTypeName((String) map.get("transactionTypeName"))
                    .transactionAccountNo((String) map.get("transactionAccountNo"))
                    .build();
        }
    }

    public static WithdrawResponseDto from(Map<String, Object> body) {
        Map<String, Object> header = (Map<String, Object>) body.get("Header");
        List<Map<String, Object>> recList = (List<Map<String, Object>>) body.get("REC");

        return WithdrawResponseDto.builder()
                .responseCode((String) header.get("responseCode"))
                .responseMessage((String) header.get("responseMessage"))
                .rec(recList.stream()
                        .map(Record::from)
                        .toList())
                .build();
    }
}
