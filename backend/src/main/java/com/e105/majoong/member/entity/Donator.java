package com.e105.majoong.member.entity;

import com.e105.majoong.common.entity.BaseEntity;
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

  @Column(name = "member_uuid", nullable = false, length = 36, unique = true)
  private String memberUuid;

  @Column(name = "name", length = 25)
  private String name;

  @Column(name = "wallet_address", length = 42)
  private String walletAddress;

  @Column(name = "keystore_cipher", columnDefinition = "MEDIUMTEXT")
  private String keystoreCipher;

  @Column(name = "email", length = 255)
  private String email;
}
