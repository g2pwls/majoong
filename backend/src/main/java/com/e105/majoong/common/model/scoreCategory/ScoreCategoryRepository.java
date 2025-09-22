package com.e105.majoong.common.model.scoreCategory;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreCategoryRepository extends JpaRepository<ScoreCategory, Long> {
    Optional<ScoreCategory> findByCategory(String category);
}
