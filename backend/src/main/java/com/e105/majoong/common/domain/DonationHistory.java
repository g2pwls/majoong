package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_history")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String donatorUuid;

    @Column(nullable = false)
    private String farmUuid;

    @Column(nullable = false)
    private Integer donationToken;

    @Column(nullable = false)
    private LocalDateTime donationDate;
}
