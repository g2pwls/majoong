package com.e105.majoong.farm.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UsageDetailItemDto {
    private String item;
    private Integer count;
    private Integer pricePerItem;
    private Integer amount; // count * pricePerItem
}
