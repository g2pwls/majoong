package com.e105.majoong.mypage.service;

import com.e105.majoong.mypage.dto.in.DonatorCardCreateDto;
import com.e105.majoong.mypage.dto.out.HorseInFarmResponseDto;
import java.util.List;

public interface DonatorCollectionService {
    List<HorseInFarmResponseDto> getHorsesByDonator(String memberUuid, String farmUuid);

    List<HorseInFarmResponseDto> getCollectionList(String memberUuid, String farmUuid);

    void createCollection(String memberUuid, DonatorCardCreateDto dto);

}
