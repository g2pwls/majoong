package com.e105.majoong.mypage.dto.in;

import com.e105.majoong.common.model.collection.CollectionCard;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class DonatorCardCreateDto {
    private String horseNumber;
    private String farmUuid;

    public CollectionCard toEntity(String memberUuid) {
        return CollectionCard.builder()
                .memberUuid(memberUuid)
                .horseNumber(horseNumber)
                .farmUuid(farmUuid)
                .cardCount(1)
                .build();
    }
}
