package com.e105.majoong.common.model.bookmark;

import com.e105.majoong.common.model.bookmark.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    boolean existsByMemberUuidAndFarmUuid(String memberUuid, String farmUuid);
}

