package com.e105.majoong.farm.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.farm.dto.out.FarmDetailResponseDto;
import com.e105.majoong.farm.dto.out.FarmListResponseDto;
import com.e105.majoong.farm.service.FarmService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/farms")
@RequiredArgsConstructor
@Tag(name = "Farm API", description = "농장 관련 API")
public class FarmController {

    private final FarmService farmService;

    @GetMapping
    public BaseResponse<Page<FarmListResponseDto>> searchFarms(
            @RequestParam(required = false) String farmName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Page<FarmListResponseDto> result = farmService.searchFarms(farmName, page, size, user.getMemberUuid());
        return new BaseResponse<>(result);
    }

    @GetMapping("/{farmUuid}")
    public BaseResponse<FarmDetailResponseDto> getFarmDetail(
            @PathVariable String farmUuid
    ) {
        return new BaseResponse<>(farmService.getFarmDetail(farmUuid));
    }

}
