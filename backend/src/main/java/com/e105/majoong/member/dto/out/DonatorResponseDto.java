package com.e105.majoong.member.dto.out;

import com.e105.majoong.common.model.donator.Donator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class DonatorResponseDto {
    private String role;
    private String nameString;
    private String email;
    private String walletAddress;

    public static DonatorResponseDto toDto(Donator d) {
        return DonatorResponseDto.builder()
                .role("donator")
                .nameString(d.getName())
                .email(d.getEmail())
                .walletAddress(d.getWalletAddress())
                .build();
    }
}
