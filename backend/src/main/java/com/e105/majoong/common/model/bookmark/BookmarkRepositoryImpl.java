package com.e105.majoong.common.model.bookmark;

import com.e105.majoong.common.model.farm.QFarm;
import com.e105.majoong.mypage.dto.out.BookmarkResponseDto;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class BookmarkRepositoryImpl implements BookmarkRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    private final QBookmark bookmark = QBookmark.bookmark;
    private final QFarm farm = QFarm.farm;

    @Override
    public List<BookmarkResponseDto> findBookmarks(String memberUuid) {
        return queryFactory.select(Projections.constructor(BookmarkResponseDto.class,
                        bookmark.farmUuid,
                        farm.farmName))
                .from(bookmark)
                .join(farm).on(bookmark.farmUuid.eq(farm.farmUuid))
                .where(bookmark.memberUuid.eq(memberUuid))
                .fetch();
    }
}
