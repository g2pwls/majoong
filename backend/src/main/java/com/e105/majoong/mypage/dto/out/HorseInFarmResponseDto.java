package com.e105.majoong.mypage.dto.out;

import com.e105.majoong.common.model.horse.Horse;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class HorseInFarmResponseDto {
    private String farmName;
    private String horseNumber;
    private String horseName;
    private String profileImage;
    private LocalDate birth;
    private Integer raceCount;
    private String gender;
    private String breed;
    private Long totalPrize;
    private LocalDate firstRaceDate;
    private LocalDate lastRaceDate;

    public static HorseInFarmResponseDto toDto(String farmName, Horse horse) {
        return HorseInFarmResponseDto.builder()
                .farmName(farmName)
                .horseName(horse.getHorseName())
                .horseNumber(horse.getHorseNumber())
                .profileImage(horse.getProfileImage())
                .birth(horse.getBirth())
                .raceCount(horse.getRaceCount())
                .gender(horse.getGender())
                .breed(horse.getBreed())
                .totalPrize(horse.getTotalPrize())
                .firstRaceDate(horse.getFirstRaceDate())
                .lastRaceDate(horse.getLastRaceDate())
                .build();
    }
}
