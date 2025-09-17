package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.domain.Farm;
import lombok.*;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmDetailResponseDto {
    private String farmUuid;
    private String farmName;
    private String profileImage;
    private double totalScore;
    private String address;
    private String OwnerName;
    private String phoneNumber;
    private int horseCount;
    private long monthTotalAmount;
    private List<MonthlyScoreResponseDto> monthlyScores;
    private List<FarmHorseDetailResponseDto> horses;

    public static FarmDetailResponseDto toDto(
            Farm farm,
            List<MonthlyScoreResponseDto> monthlyScores,
            List<FarmHorseDetailResponseDto> horses,
            long monthTotalAmount
    ) {
        return FarmDetailResponseDto.builder()
                .farmUuid(farm.getFarmUuid())
                .farmName(farm.getFarmName())
                .profileImage(farm.getProfileImage())
                .totalScore(farm.getTotalScore() != null ? farm.getTotalScore() : 0.0)
                .address(farm.getAddress())
                .OwnerName(farm.getOwnerName())
                .phoneNumber(farm.getPhoneNumber())
                .horseCount(farm.getHorseCount() != null ? farm.getHorseCount() : horses.size())
                .monthTotalAmount(monthTotalAmount)
                .monthlyScores(monthlyScores)
                .horses(horses)
                .build();
    }
}
