package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "receipt_history")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String farmUuid;

    @Column(nullable = false)
    private String memberUuid;

    @Column(nullable = false)
    private String storeName;

    @Column(nullable = false)
    private String storeAddress;

    @Column(nullable = false)
    private String storeNumber;

    @Column(nullable = false)
    private Integer totalAmount;

    private LocalDateTime transactionDate;

    @Column(nullable = false)
    private String photoUrl;

    @Column(nullable = false)
    private String aiSummary;

    private String notes;

    @Column(nullable = false)
    private Long categoryId;
}

