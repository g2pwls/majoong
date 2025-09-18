package com.e105.majoong.common.model.myScore;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "my_score")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 12)
    private String farmUuid;

    @Column(nullable = false, length = 36)
    private String memberUuid;

    @CreatedDate
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Long scoreCategoryId;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month;
}
