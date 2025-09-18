package com.e105.majoong.mypage.dto.out;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DonationHistoryResponseDto {
    private String farmUuid;
    private LocalDateTime donationDate;
    private String farmName;
    private Long donationToken;
}
