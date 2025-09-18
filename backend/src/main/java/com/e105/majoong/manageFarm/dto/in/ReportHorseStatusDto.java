package com.e105.majoong.manageFarm.dto.in;

import com.e105.majoong.common.model.horseState.HorseState;
import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Builder
public class ReportHorseStatusDto {
    private MultipartFile frontImage;
    private MultipartFile leftSideImage;
    private MultipartFile rightSideImage;
    private MultipartFile stableImage;
    private String content;

    public HorseState toEntity(String farmUuid, String memberUuid, Long horseNumber,
                               String frontImage, String leftSideImage, String rightSideImage, String stableImage) {
        return HorseState.builder()
                .farmUuid(farmUuid)
                .memberUuid(memberUuid)
                .horseNumber(horseNumber)
                .frontImage(frontImage)
                .leftSideImage(leftSideImage)
                .rightSideImage(rightSideImage)
                .stableImage(stableImage)
                .content(content)
                .build();
    }
}
