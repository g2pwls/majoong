package com.e105.machimnae.member.entity;

import com.e105.machimnae.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "donator")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donator extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_uuid", nullable = false, length = 36)
    private String memberUuid;

    @Column(name = "name", length = 25)
    private String name;

    @Column(name = "wallet_address", length = 1024)
    private String walletAddress;

    @Column(name = "email", length = 255)
    private String email;
}