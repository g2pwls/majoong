package com.e105.majoong.mypage.service;

import com.e105.majoong.mypage.dto.in.DonatorCardCreateDto;
import com.e105.majoong.mypage.dto.out.CollectionResponseDto;
import com.e105.majoong.mypage.dto.out.HorseInFarmResponseDto;
import java.util.List;

public interface DonatorCollectionService {
    List<HorseInFarmResponseDto> getHorsesByDonator(String memberUuid, String farmUuid);

    CollectionResponseDto getCollectionList(String memberUuid);

    void createCollection(String memberUuid, DonatorCardCreateDto dto);

}
