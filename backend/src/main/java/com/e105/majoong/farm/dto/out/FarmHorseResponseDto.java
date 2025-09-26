package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.horse.Horse;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmHorseResponseDto {
    private String horseNumber;
    private String profileImage;
    private String horseName;

    public static FarmHorseResponseDto toDto(Horse horse) {
        return FarmHorseResponseDto.builder()
                .horseNumber(horse.getHorseNumber())
                .profileImage(horse.getProfileImage())
                .horseName(horse.getHorseName())
                .build();
    }
}
