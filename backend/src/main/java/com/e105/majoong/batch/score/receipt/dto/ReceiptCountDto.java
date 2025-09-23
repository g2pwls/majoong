package com.e105.majoong.batch.score.receipt.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReceiptCountDto {
    private String farmUuid;
    private long count;
}
