package com.e105.majoong.mypage.dto.in;

import com.e105.majoong.common.model.bookmark.Bookmark;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookmarkRequestDto {

    public static Bookmark toEntity(String memberUuid, String farmUuid) {
        return Bookmark.builder()
                .farmUuid(farmUuid)
                .memberUuid(memberUuid)
                .build();
    }
}
