package com.e105.majoong.mamageFarm.dto.in;

import com.e105.majoong.common.domain.Farm;
import com.e105.majoong.common.domain.Horse;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HorseInfoUpdateDto {
    private Long horseNumber;
    private String horseName;
    private LocalDate birth;
    private String gender;
    private String color;
    private String breed;
    private String countryOfOrigin;
    private Integer raceCount;
    private Integer firstPlaceCount;
    private Integer secondPlaceCount;
    private Long totalPrize;
    private LocalDate retiredDate;
    private LocalDate firstRaceDate;
    private LocalDate lastRaceDate;
    private String profileImage;

    public Horse toEntity(Farm farm) {
        return Horse.builder()
                .farm(farm)
                .horseNumber(horseNumber)
                .horseName(horseName)
                .birth(birth)
                .gender(gender)
                .breed(breed)
                .color(color)
                .countryOfOrigin(countryOfOrigin)
                .raceCount(raceCount)
                .firstPlaceCount(firstPlaceCount)
                .secondPlaceCount(secondPlaceCount)
                .totalPrize(totalPrize)
                .retiredDate(retiredDate)
                .firstRaceDate(firstRaceDate)
                .lastRaceDate(lastRaceDate)
                .profileImage(profileImage)
                .build();
    }
}
