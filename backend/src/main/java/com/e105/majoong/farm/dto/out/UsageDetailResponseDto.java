package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.model.receiptDetailHistory.ReceiptDetailHistory;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UsageDetailResponseDto {
    private String certificationImageUrl;
    private String storeName;
    private String address;
    private String storeNumber;
    private LocalDateTime transactionAt;
    private String aiSummary;
    private String content;
    private String photoUrl;
    private List<UsageDetailItemDto> detailList;
    private Integer totalAmount;

    public static UsageDetailResponseDto fromEntity(ReceiptHistory history, List<ReceiptDetailHistory> details) {
        List<UsageDetailItemDto> items = details.stream()
                .map(d -> new UsageDetailItemDto(
                        d.getItemName(),
                        d.getQuantity(),
                        d.getPricePerItem(),
                        d.getQuantity() * d.getPricePerItem()
                ))
                .toList();

        return UsageDetailResponseDto.builder()
                .certificationImageUrl(history.getPhotoUrl())
                .storeName(history.getStoreName())
                .address(history.getStoreAddress())
                .storeNumber(history.getStoreNumber())
                .transactionAt(history.getCreatedAt())
                .aiSummary(history.getAiSummary())
                .content(history.getContent())
                .photoUrl(history.getPhotoUrl())
                .detailList(items)
                .totalAmount(history.getTotalAmount())
                .build();
    }
}