package com.e105.majoong.manageFarm.dto.in;

import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.common.utils.CodeGenerator;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

@Builder
@Getter
public class FarmInfoCreateDto {
    private String phoneNumber;
    private String address;
    private LocalDate openingDate;
    private Double area;
    private String description;
    private MultipartFile profileImage;

    public Farm toEntity(Farmer farmer, double latitude, double longitude, String image) {
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
                .profileImage(image)
                .latitude(latitude)
                .longitude(longitude)
                .horseCount(0)
                .totalScore(38.2)
                .totalDonation(0L)
                .usedAmount(0L)
                .build();
    }
}
