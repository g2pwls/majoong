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
    private String donatorName;
    private Long donationToken;
    private Long donationAmount;
    private LocalDateTime donationDate;
    private String txHash;
    private Long balance;
    private String type;
    private Long receiptHistoryId;
}
