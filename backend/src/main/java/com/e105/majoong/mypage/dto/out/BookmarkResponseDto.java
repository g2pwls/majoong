package com.e105.majoong.mypage.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class BookmarkResponseDto {
    private String farmName;
    private String farmUuid;

}
