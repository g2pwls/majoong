package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "farmer")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_uuid", nullable = false, length = 36, unique = true)
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

    @Column(name = "keystore_cipher", columnDefinition = "MEDIUMTEXT")
    private String keystoreCipher;

    @Column(name = "email", length = 255)
    private String email;

    public void updateWalletAddress(String address) {
        this.walletAddress = address;
    }

    public void updateKeystoreCipher(String cipher) {
        this.keystoreCipher = cipher;
    }
}