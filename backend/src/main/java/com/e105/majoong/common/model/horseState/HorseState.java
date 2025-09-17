package com.e105.majoong.common.model.horseState;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "horse_state")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorseState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 12)
    private String farmUuid;

    @Column(nullable = false, length = 36)
    private String memberUuid;

    @Column(nullable = false)
    private Long horseNumber;

    @CreatedDate
    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    private String frontImage;
    private String leftSideImage;
    private String rightSideImage;
    private String stableImage;

    @Column(length = 1000)
    private String aiSummary;
    @Column(length = 1000)
    private String content;
}

