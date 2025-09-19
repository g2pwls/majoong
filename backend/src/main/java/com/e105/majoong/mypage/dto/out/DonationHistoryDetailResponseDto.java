package com.e105.majoong.mypage.dto.out;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DonationHistoryDetailResponseDto {
    private String imageUrl;
    private LocalDateTime donationDate;
    private String donatorWalletAddress;
    private String farmWalletAddress;
    private Long donationToken;
    private String txHash;
    private String farmName;
}
