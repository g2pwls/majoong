package com.e105.majoong.common.model.farm;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import org.springframework.data.annotation.CreatedDate;

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

    @CreatedDate
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

    //실패시 NPE 방지
    public void updateTotalDonation(Long amount) {
      long delta = (amount == null ? 0L : amount);
      long base  = (this.totalDonation == null ? 0L : this.totalDonation);
      this.totalDonation = base + delta;
    }
    public void updateUsedAmount(Long amount) {
      long delta = (amount == null ? 0L : amount);
      long base  = (this.usedAmount == null ? 0L : this.usedAmount);
      this.usedAmount = base + delta;
    }
    public void updateTotalScore(Double totalScore) {
        this.totalScore = totalScore;
    }
}
