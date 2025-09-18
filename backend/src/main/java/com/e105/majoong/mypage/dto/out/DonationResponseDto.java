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
            long totalAmount,
            Page<DonationHistoryResponseDto> donationHistory
    ) {
        return DonationResponseDto.builder()
                .totalCoin(totalCoin)
                .totalAmount(totalAmount)
                .donationHistory(donationHistory)
                .build();
    }
}
