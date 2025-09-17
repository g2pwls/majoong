package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.horse.Horse;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class HorseDetailResponseDto {
    private Long horseNumber;
    private String horseName;
    private String farmName;
    private LocalDate birth;
    private String gender;
    private String color;
    private String breed;
    private String countryOfOrigin;
    private Integer raceCount;
    private Integer firstPlaceCount;
    private Integer secondPlaceCount;
    private Long totalPrize;
    private LocalDate retireDate;
    private LocalDate firstRaceDate;
    private LocalDate lastRaceDate;
    private String horseImageUrl;

    private List<HorseWeeklyReportDto> weeklyReport;

    public static HorseDetailResponseDto toDto(Horse horse, List<HorseWeeklyReportDto> weeklyReports) {
        return HorseDetailResponseDto.builder()
                .horseNumber(horse.getHorseNumber())
                .horseName(horse.getHorseName())
                .farmName(horse.getFarm().getFarmName())
                .birth(horse.getBirth())
                .gender(horse.getGender())
                .color(horse.getColor())
                .breed(horse.getBreed())
                .countryOfOrigin(horse.getCountryOfOrigin())
                .raceCount(horse.getRaceCount())
                .firstPlaceCount(horse.getFirstPlaceCount())
                .secondPlaceCount(horse.getSecondPlaceCount())
                .totalPrize(horse.getTotalPrize())
                .retireDate(horse.getRetiredDate())
                .firstRaceDate(horse.getFirstRaceDate())
                .lastRaceDate(horse.getLastRaceDate())
                .horseImageUrl(horse.getProfileImage())
                .weeklyReport(weeklyReports)
                .build();
    }
}