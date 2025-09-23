package com.e105.majoong.kakaoPay.dto.out;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReadyResponseDto {
    String tid;
    @JsonProperty("next_redirect_pc_url")
    private String nextRedirectPcUrl;

    @JsonProperty("next_redirect_mobile_url")
    private String nextRedirectMobileUrl;

}
