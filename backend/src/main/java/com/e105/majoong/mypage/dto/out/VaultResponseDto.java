package com.e105.majoong.mypage.dto.out;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

@Builder
@Getter
@AllArgsConstructor
public class VaultResponseDto {
    private Long totalDonation;
    private Long usedAmount;
    private Long currentBalance; //지갑 잔액
    private String farmVaultAddress;
    private Page<VaultHistoryResponseDto> vaultHistoryResponseDtos;

    public static VaultResponseDto toDto(
            Long totalDonation,
            Long usedAmount,
            Long currentBalance,
            Page<VaultHistoryResponseDto> vaultHistoryResponseDtos
    ) {
        return VaultResponseDto.builder()
                .totalDonation(totalDonation)
                .usedAmount(usedAmount)
                .currentBalance(currentBalance)
                .vaultHistoryResponseDtos(vaultHistoryResponseDtos)
                .build();
    }

    public static VaultResponseDto toDto(
            Long totalDonation,
            Long usedAmount,
            Long currentBalance,
            String farmVaultAddress,
            Page<VaultHistoryResponseDto> vaultHistoryResponseDtos
    ) {
        return VaultResponseDto.builder()
                .totalDonation(totalDonation)
                .usedAmount(usedAmount)
                .currentBalance(currentBalance)
                .farmVaultAddress(farmVaultAddress)
                .vaultHistoryResponseDtos(vaultHistoryResponseDtos)
                .build();
    }
}
