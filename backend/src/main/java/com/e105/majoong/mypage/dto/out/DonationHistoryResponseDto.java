package com.e105.majoong.mypage.dto.out;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DonationHistoryResponseDto {
    private Long donationHistoryId;
    private String farmUuid;
    private LocalDateTime donationDate;
    private String farmName;
    private Long donationToken;
}
