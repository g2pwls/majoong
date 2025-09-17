package com.e105.majoong.farm.dto.out;

import com.e105.majoong.common.domain.ReceiptHistory;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReceiptHistoryResponseDto {
    private LocalDateTime createdAt;
    private String category;
    private Integer totalAmount;

    public static ReceiptHistoryResponseDto from(ReceiptHistory history, String categoryName) {
        return new ReceiptHistoryResponseDto(
                history.getCreatedAt(),
                categoryName,
                history.getTotalAmount()
        );
    }
}