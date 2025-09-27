package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.farm.Farm;
import lombok.*;

import java.time.LocalDateTime;
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
    private long purposeTotalAmount;
    private double area;
    private String description;
    private LocalDateTime createdAt;
    private long donationCount;
    private List<MonthlyScoreResponseDto> monthlyScores;
    private List<FarmHorseDetailResponseDto> horses;
    private boolean bookmarked;

    public static FarmDetailResponseDto toDto(
            Farm farm,
            List<MonthlyScoreResponseDto> monthlyScores,
            List<FarmHorseDetailResponseDto> horses,
            long monthTotalAmount,
            long uniqueDonators,
            boolean bookmarked
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
                .purposeTotalAmount(horses.size()*1000000)
                .monthlyScores(monthlyScores)
                .horses(horses)
                .description(farm.getDescription())
                .createdAt(farm.getCreatedAt())
                .donationCount(uniqueDonators)
                .area(farm.getArea())
                .bookmarked(bookmarked)
                .build();
    }
}
