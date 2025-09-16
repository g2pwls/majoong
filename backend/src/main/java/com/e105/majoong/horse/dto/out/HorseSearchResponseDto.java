package com.e105.majoong.horse.dto.out;

import com.e105.majoong.common.domain.Horse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorseSearchResponseDto {
    private String farmUuid;
    private Long horseId;
    private Long horseNumber;
    private String profileImage;
    private String horseName;
    private String ownerName;
    private String farmName;
    private String countryOfOrigin;
    private String birth;
    private String color;
    private String gender;

    public static HorseSearchResponseDto toDto(Horse horse) {
        return HorseSearchResponseDto.builder()
                .farmUuid(horse.getFarm().getFarmUuid())
                .horseId(horse.getId())
                .horseNumber(horse.getHorseNumber())
                .profileImage(horse.getProfileImage())
                .horseName(horse.getHorseName())
                .ownerName(horse.getFarm().getOwnerName())
                .farmName(horse.getFarm().getFarmName())
                .countryOfOrigin(horse.getCountryOfOrigin())
                .birth(horse.getBirth() != null ? horse.getBirth().toString() : null)
                .color(horse.getColor())
                .gender(horse.getGender())
                .build();
    }
}
