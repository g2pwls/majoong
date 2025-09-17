package com.e105.majoong.manageFarm.dto.in;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.common.utils.CodeGenerator;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class FarmInfoUpdateDto {
    private String phoneNumber;
    private String address;
    private LocalDate openingDate;
    private Double area;
    private String description;
    private String profileImage;

    public Farm toEntity(Farmer farmer, double latitude, double longitude) {
        return Farm.builder()
                .memberUuid(farmer.getMemberUuid())
                .farmUuid("FARM-" + CodeGenerator.generateCode(6))
                .ownerName(farmer.getName())
                .farmName(farmer.getFarmName())
                .phoneNumber(phoneNumber)
                .address(address)
                .openingDate(farmer.getOpeningAt())
                .area(area)
                .description(description)
                .profileImage(profileImage)
                .latitude(latitude)
                .longitude(longitude)
                .horseCount(0)
                .totalScore(38.2)
                .totalDonation(0L)
                .usedAmount(0L)
                .build();
    }
}
