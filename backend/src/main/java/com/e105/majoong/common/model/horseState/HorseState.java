package com.e105.majoong.common.model.horseState;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "horse_state")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class HorseState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 12)
    private String farmUuid;

    @Column(nullable = false, length = 36)
    private String memberUuid;

    @Column(nullable = false)
    private String horseNumber;

    @CreatedDate
    private LocalDateTime uploadedAt;

    private String frontImage;
    private String leftSideImage;
    private String rightSideImage;
    private String stableImage;

    @Column(length = 1000)
    private String aiSummary;
    @Column(length = 1000)
    private String content;

    public void updateAISummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }
}

