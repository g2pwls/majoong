package com.e105.majoong.mypage.dto.out;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class CollectionResponseDto {
    public int count;
    public List<HorseInFarmResponseDto> dtos;

    public static CollectionResponseDto toDto(int count, List<HorseInFarmResponseDto> dtos) {
        return CollectionResponseDto.builder()
                .count(count)
                .dtos(dtos)
                .build();
    }
}
