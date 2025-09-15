package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "horse")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Horse extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmId;

    @Column(nullable = false)
    private Long horseNumber;

    @Column(nullable = false)
    private String horseName;

    private LocalDate birthDate;

    private String gender;

    private String coatColor;

    private String breed;

    private String countryOfOrigin;

    private Integer races;

    private Integer firstPlace;

    private Integer secondPlace;

    private Long prize;

    private LocalDate retiredDate;

    private LocalDate firstRaceDate;

    private LocalDate lastRaceDate;

    private String profileImage;
}
