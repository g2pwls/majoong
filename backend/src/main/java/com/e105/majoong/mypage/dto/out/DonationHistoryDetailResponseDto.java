package com.e105.majoong.mypage.dto.out;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DonationHistoryDetailResponseDto {
    private String imageUrl;
    private String donationDate;
    private String donatorWalletAddress;
    private String farmWalletAddress;
    private String donationToken;
    private String txHash;
    private String farmName;
}
