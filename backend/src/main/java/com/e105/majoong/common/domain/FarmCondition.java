package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm_condition")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmCondition extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String farmUuid;

    @Column(nullable = false)
    private String memberUuid;

    @Column(nullable = false)
    private String frontPhotoUrl;

    @Column(nullable = false)
    private String stablePhotoUrl;

    @Column(nullable = false)
    private String aiSummary;

    @Column(nullable = false)
    private String farmerNotes;

    private LocalDateTime updatedAt;
}
