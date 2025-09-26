package com.e105.majoong.manageFarm.dto.in;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.horse.Horse;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Builder
public class HorseInfoUpdateDto {
    private String farmUuid;
    private String horseNumber;
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
    private MultipartFile profileImage;

    public Horse toEntity(Farm farm, String image) {
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
                .profileImage(image)
                .build();
    }
}
