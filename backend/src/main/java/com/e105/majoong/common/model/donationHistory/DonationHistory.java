package com.e105.majoong.common.model.donationHistory;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name="donation_history")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationHistory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long donationToken;

    @Column(nullable = false, updatable = false)
    private LocalDateTime donationDate;

    @Column(nullable = false, length = 36)
    private String donatorUuid;

    @Column(nullable = false, length = 36)
    private String farmerUuid;

    @Column(nullable = false, length = 12)
    private String farmUuid;

    @Column(name="tx_hash", length = 66)
    private String txHash;

    @PrePersist
    void onCreate() {
      if (donationDate == null) donationDate = LocalDateTime.now();
    }

    public void updateDonationToken(Long donationToken) {
        this.donationToken = donationToken;
    }

    public void updateDonationDate(LocalDateTime donationDate) {
        this.donationDate = donationDate;
    }

    public void updateFarmUuid(String farmUuid) {
        this.farmUuid = farmUuid;
    }
    public void updateDonatorUuid(String donatorUuid) {
        this.donatorUuid = donatorUuid;
    }

    public void updateFarmerUuid(String farmerUuid) {
        this.farmerUuid = farmerUuid;
    }

    public void updateTxHash(String txHash) {
        this.txHash = txHash;
    }

}
