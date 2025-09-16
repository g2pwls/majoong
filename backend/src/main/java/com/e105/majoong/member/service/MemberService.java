package com.e105.majoong.member.service;

import com.e105.majoong.member.dto.out.DonatorResponseDto;
import com.e105.majoong.member.dto.out.FarmerResponseDto;

public interface MemberService {
    DonatorResponseDto getDonatorInfo(String memberUuid);
    FarmerResponseDto getFarmerInfo(String memberUuid);
}
