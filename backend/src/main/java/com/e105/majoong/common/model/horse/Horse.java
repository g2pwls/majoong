package com.e105.majoong.common.model.horse;

import com.e105.majoong.common.entity.BaseEntity;
import com.e105.majoong.common.model.farm.Farm;
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
    private Long horseNumber;

    @Column(nullable = false, length = 25)
    private String horseName;

    private LocalDate birth;

    @Column(length = 50)
    private String gender;

    @Column(length = 30)
    private String color;

    @Column(length = 50)
    private String breed;

    @Column(length = 50)
    private String countryOfOrigin;

    private Integer raceCount;

    private Integer firstPlaceCount;

    private Integer secondPlaceCount;

    private Long totalPrize;

    private LocalDate retiredDate;

    private LocalDate firstRaceDate;

    private LocalDate lastRaceDate;

    @Column(nullable = false)
    private String profileImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;
}
