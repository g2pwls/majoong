package com.e105.majoong.farm.repository;

import com.e105.majoong.common.domain.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    boolean existsByMemberUuidAndFarmUuid(String memberUuid, String farmUuid);
}

