package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

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

    @Column(nullable = false, length = 36, unique = true)
    private String memberUuid;

    @Column(nullable = false, length = 12)
    private String farmUuid;

    @Column(nullable = false, length = 50)
    private String farmName;

    @Column(nullable = false, length = 25)
    private String ownerName;

    @Column(length = 20)
    private String phoneNumber;

    private String address;

    @Column(nullable = false)
    private LocalDate openingDate;

    private Double latitude;

    private Double longitude;

    private Double area;

    @Column(length = 1000)
    private String description;

    private Integer horseCount;

    private Double totalScore;

    private Long totalDonation;

    private Long usedAmount;

    private String profileImage;
}
