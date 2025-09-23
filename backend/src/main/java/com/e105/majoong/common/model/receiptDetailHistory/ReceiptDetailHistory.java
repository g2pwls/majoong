package com.e105.majoong.common.model.receiptDetailHistory;

import com.e105.majoong.common.entity.BaseEntity;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
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
    private String itemName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer pricePerItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    private ReceiptHistory receiptHistory;

  public void updateQuantity(Integer quantity){ this.quantity = quantity; }
  public void updatePricePerItem(Integer pricePerItem){ this.pricePerItem = pricePerItem; }
}
