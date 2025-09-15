package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "my_score")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyScore extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String farmUuid;

    @Column(nullable = false)
    private String memberUuid;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Long scoreCategoryId;

    @Column(nullable = false)
    private Integer currentScore;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month;
}
