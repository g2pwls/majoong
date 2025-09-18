package com.e105.majoong.mypage.dto.out;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class BookmarkResponseDto {
    private String farmName;
    private String farmUuid;

}
