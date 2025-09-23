package com.e105.majoong.mypage.dto.out;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class AccountHistoryResponseDto {
    private String balance; // 현재 잔액
    private List<TransactionDto> transactions;

    @Data
    @AllArgsConstructor
    public static class TransactionDto {
        private String date; //출금 날짜
        private String time; //출금 시각
        private String amount; //출금 금액
        private String afterBalance; //출금 후 잔액
    }
}
