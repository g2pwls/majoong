package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "horse_state")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorseState extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String farmUuid;

    @Column(nullable = false)
    private String memberUuid;

    @Column(nullable = false)
    private Long horseNumber;

    private LocalDateTime updatedAt;

    private String frontPhoto;
    private String leftSidePhoto;
    private String rightSidePhoto;
    private String stablePhotoUrl;
    private String aiSummary;
    private String notes;
}

