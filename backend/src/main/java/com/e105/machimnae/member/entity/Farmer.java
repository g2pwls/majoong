package com.e105.machimnae.member.entity;

import com.e105.machimnae.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "farmer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_uuid", nullable = false, length = 36)
    private String memberUuid;

    @Column(name = "name", length = 25)
    private String name;

    @Column(name = "farm_name", length = 50)
    private String farmName;

    @Column(name = "business_num", length = 255)
    private String businessNum;

    @Column(name = "opening_at")
    private LocalDate openingAt;

    @Column(name = "wallet_address", length = 1024)
    private String walletAddress;

    @Column(name = "email", length = 255)
    private String email;
}