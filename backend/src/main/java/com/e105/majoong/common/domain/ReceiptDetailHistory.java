package com.e105.majoong.common.domain;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "receipt_detail_history")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptDetailHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long receiptId;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer pricePerItem;
}
