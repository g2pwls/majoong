package com.e105.majoong.kakaoPay.dto.out;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReadyResponseDto {
    String tid;
    String next_redirect_pc_url;
}
