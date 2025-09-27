package com.e105.majoong.common.model.collection;

import com.e105.majoong.mypage.dto.out.HorseInFarmResponseDto;
import java.util.List;

public interface CollectionCardRepositoryCustom {
    List<HorseInFarmResponseDto> getCollectionList(String memberUuid);

    long incrementCardCount(String memberUuid, String farmUuid, String horseNumber);

}
