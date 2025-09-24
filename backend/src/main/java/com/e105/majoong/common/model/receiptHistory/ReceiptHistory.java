package com.e105.majoong.common.model.receiptHistory;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "receipt_history")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ReceiptHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 12)
    private String farmUuid;

    @Column(nullable = false, length = 36)
    private String memberUuid;

    @Column(nullable = false)
    private String storeName;

    @Column(nullable = false)
    private String storeAddress;

    @Column(nullable = false, length = 15)
    private String storeNumber;

    @Column(nullable = false)
    private Integer totalAmount;

    @CreatedDate
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String photoUrl;

    @Column(nullable = false, length = 1000)
    private String aiSummary;

    @Column(length = 1000)
    private String content;

    @Column(nullable = false)
    private Long categoryId;

    @Column(nullable=false, unique=true)
    private String idempotencyKey;

    @Column(nullable=false, unique=true)
    private Long approvalNumber;

    public void updateCategoryId(Long categoryId){ this.categoryId = categoryId; }
    public void updateSummary(String aiSummary){ this.aiSummary = aiSummary; }
    public void updateContent(String content){ this.content = content; }
}

