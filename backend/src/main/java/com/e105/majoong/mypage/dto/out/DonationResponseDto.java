package com.e105.majoong.mypage.dto.out;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

@Builder
@Getter
public class DonationResponseDto {
    private long totalCoin;
    private long totalAmount;
    private Page<DonationHistoryResponseDto> donationHistory;

    public static DonationResponseDto toDto(
            long totalCoin,
            Page<DonationHistoryResponseDto> donationHistory
    ) {
        return DonationResponseDto.builder()
                .totalCoin(totalCoin)
                .totalAmount(totalCoin*100)
                .donationHistory(donationHistory)
                .build();
    }
}
