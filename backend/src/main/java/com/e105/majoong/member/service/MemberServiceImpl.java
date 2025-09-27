package com.e105.majoong.member.service;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farmVault.FarmVault;
import com.e105.majoong.common.model.farmVault.FarmVaultRepository;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.member.dto.out.DonatorResponseDto;
import com.e105.majoong.member.dto.out.FarmerResponseDto;
import com.e105.majoong.common.model.donator.DonatorRepository;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final DonatorRepository donatorRepository;
    private final FarmerRepository farmerRepository;
    private final FarmVaultRepository farmVaultRepository;

    @Override
    public DonatorResponseDto getDonatorInfo(String memberUuid) {
        return donatorRepository.findByMemberUuid(memberUuid)
                .map(DonatorResponseDto::toDto)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));
    }

    @Override
    public FarmerResponseDto getFarmerInfo(String memberUuid) {
        Farmer farmer = farmerRepository.findByMemberUuid(memberUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));

        FarmVault farmVault = farmVaultRepository.findByMemberUuid(memberUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));

        return FarmerResponseDto.toDto(farmer, farmVault);
    }

}
