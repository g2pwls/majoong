package com.e105.majoong.mypage.dto.out;

import com.e105.majoong.common.model.donationHistory.DonationHistory;
import java.time.DateTimeException;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class VaultHistoryResponseDto {
    /*
    기부자이름
    후원 금액(토큰량)
    후원 금액(원화)
    기부 일시(yyyy-mm-dd hh:mm:ss)
    tx_hash
    거래 후 잔액
     */                         //settlementHistory
    private String donatorName; //지갑
    private Long donationToken; //releasedAmount
    private Long donationAmount; //releasedAmount*1000
    private LocalDateTime donationDate; //createAt
    private String txHash; //txHash
    private Long balance; //balance
    private String type; //
}
