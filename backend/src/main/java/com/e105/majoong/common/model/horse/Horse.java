package com.e105.majoong.common.model.horse;

import com.e105.majoong.common.entity.BaseEntity;
import com.e105.majoong.common.model.farm.Farm;
import jakarta.persistence.*;
import java.time.LocalDateTime;
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
    private String horseNumber;

    @Column(nullable = false, length = 25)
    private String horseName;

    private String birth;

    @Column(length = 50)
    private String gender;

    @Column(length = 30)
    private String color;

    @Column(length = 50)
    private String breed;

    @Column(length = 50)
    private String countryOfOrigin;

    private String raceCount;

    private String firstPlaceCount;

    private String secondPlaceCount;

    private String totalPrize;

    private String retiredDate;

    private String firstRaceDate;

    private String lastRaceDate;

    @Column(nullable = false)
    private String profileImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void updateDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
