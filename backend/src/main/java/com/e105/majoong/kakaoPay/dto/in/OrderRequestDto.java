package com.e105.majoong.kakaoPay.dto.in;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderRequestDto {
    String totalPrice;
    String farmUuid;
}