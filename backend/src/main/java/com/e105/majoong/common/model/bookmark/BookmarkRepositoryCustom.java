package com.e105.majoong.common.model.bookmark;

import com.e105.majoong.mypage.dto.out.BookmarkResponseDto;
import java.util.List;

public interface BookmarkRepositoryCustom {
    List<BookmarkResponseDto> findBookmarks(String memberUuid);
}
