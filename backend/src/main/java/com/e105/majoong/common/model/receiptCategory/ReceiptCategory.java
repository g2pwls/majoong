package com.e105.majoong.common.model.receiptCategory;

import com.e105.majoong.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "receipt_category")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptCategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private ReceiptCategoryType category;
}
