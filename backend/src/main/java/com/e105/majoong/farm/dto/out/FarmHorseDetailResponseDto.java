package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.horse.Horse;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmHorseDetailResponseDto {
    private String horseUuid;
    private String horseUrl;
    private String horseName;
    private String birth;
    private String breed;
    private String gender;

    public static FarmHorseDetailResponseDto toDto(Horse horse) {
        return FarmHorseDetailResponseDto.builder()
                .horseUuid(String.valueOf(horse.getHorseNumber()))
                .horseUrl(horse.getProfileImage())
                .horseName(horse.getHorseName())
                .birth(horse.getBirth() != null ? horse.getBirth().toString() : null)
                .breed(horse.getBreed())
                .gender(horse.getGender())
                .build();
    }
}
