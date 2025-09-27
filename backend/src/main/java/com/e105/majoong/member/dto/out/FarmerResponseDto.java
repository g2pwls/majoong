package com.e105.majoong.member.dto.out;

import com.e105.majoong.common.model.farmVault.FarmVault;
import com.e105.majoong.common.model.farmer.Farmer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class FarmerResponseDto {
    private String role;
    private String nameString;
    private String email;
    private String walletAddress;
    private String businessNum;
    private String farmName;
    private String farmVaultAddress;

    // 엔티티 → DTO 변환
    public static FarmerResponseDto toDto(Farmer f, FarmVault farmVault) {
        return FarmerResponseDto.builder()
                .role("farmer")
                .nameString(f.getName())
                .email(f.getEmail())
                .walletAddress(f.getWalletAddress())
                .businessNum(f.getBusinessNum())
                .farmName(f.getFarmName())
                .farmVaultAddress(farmVault.getVaultAddress())
                .build();
    }
}
