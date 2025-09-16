package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farm extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String memberUuid;

    @Column(nullable = false)
    private String farmUuid;

    @Column(nullable = false)
    private String farmName;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String phoneNumber;

    private String farmTitle;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private LocalDate openingDate;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Double area;

    private String description;

    private Integer count;

    private Double totalScore;

    private Long totalDonation;

    private Long usedAmount;

    private String profileImage;
}
