package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.farm.Farm;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmListResponseDto {
    private String farmUuid;
    private String farmName;
    private String profileImage;
    private Double totalScore;
    private String address;
    private String ownerName;
    private int horseCount;
    private String status;
    private long monthTotalAmount;
    private long purposeTotalAmount;
    private List<FarmHorseResponseDto> horses;
    private boolean isBookmark;

    public static FarmListResponseDto toDto(Farm farm, List<FarmHorseResponseDto> FarmHorseList ,long monthTotalAmount, boolean isBookmark) {
        String status;
        Double score = farm.getTotalScore();
        if (score < 38) status = "미흡";
        else if (score < 45) status = "보통";
        else if (score < 60) status = "양호";
        else status = "우수";

        return FarmListResponseDto.builder()
                .farmUuid(farm.getFarmUuid())
                .farmName(farm.getFarmName())
                .profileImage(farm.getProfileImage())
                .totalScore(farm.getTotalScore())
                .address(farm.getAddress())
                .ownerName(farm.getOwnerName())
                .horseCount(farm.getHorseCount())
                .status(status)
                .monthTotalAmount(monthTotalAmount)
                .purposeTotalAmount(farm.getHorseCount()*1000000)
                .horses(FarmHorseList)
                .isBookmark(isBookmark)
                .build();
    }
}
