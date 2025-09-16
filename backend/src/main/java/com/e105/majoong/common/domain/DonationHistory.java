package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "donation_history")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 36)
    private String memberUuid;

    @Column(nullable = false, length = 12 )
    private String farmUuid;

    @Column(nullable = false)
    private Long donationToken;

    @CreatedDate
    @Column(nullable = false)
    private LocalDateTime donationDate;
}
