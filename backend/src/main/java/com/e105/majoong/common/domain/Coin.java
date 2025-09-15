package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coin")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coin extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_uuid", nullable = false)
    private String memberUuid;

    @Column(nullable = false)
    private BigDecimal coinAmount;

    @Column(nullable = false)
    private String transactionHash;

    @Column
    private Long history;

    @Column(nullable = false)
    private LocalDateTime requestDate;

    @Column(nullable = false)
    private Enum type;
}
