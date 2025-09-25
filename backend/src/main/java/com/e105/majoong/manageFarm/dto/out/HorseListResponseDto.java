package com.e105.majoong.manageFarm.dto.out;

import com.e105.majoong.common.model.horse.Horse;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HorseListResponseDto {
    private String horseName;
    private String breed;
    private String gender;
    private LocalDate birth;
    private String profileImage;
    private String horseNumber;

    public static HorseListResponseDto toDto(Horse horse) {
        return HorseListResponseDto.builder()
                .horseName(horse.getHorseName())
                .breed(horse.getBreed())
                .gender(horse.getGender())
                .birth(horse.getBirth())
                .profileImage(horse.getProfileImage())
                .horseNumber(horse.getHorseNumber())
                .build();
    }
}
