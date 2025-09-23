package com.e105.majoong.manageFarm.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.manageFarm.dto.in.FarmInfoCreateDto;
import com.e105.majoong.manageFarm.dto.in.HorseInfoUpdateDto;
import com.e105.majoong.manageFarm.dto.in.ReportHorseStatusDto;
import com.e105.majoong.manageFarm.dto.out.GeoDto;
import com.e105.majoong.manageFarm.dto.out.HorseListResponseDto;
import com.e105.majoong.manageFarm.service.ManageFarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/api/v1")
@Tag(name = "Farm Manage API", description = "목장 관리 관련 API")
public class ManageFarmController {

    private final ManageFarmService manageFarmService;

    @PostMapping(value = "/members/farmers/my-farm", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "목장 정보 등록")
    public BaseResponse<String> updateFarm(@AuthenticationPrincipal CustomUserDetails user,
                                           @ModelAttribute FarmInfoCreateDto dto) {
        return new BaseResponse<>(manageFarmService.updateFarm(user.getMemberUuid(), dto));
    }

    @PostMapping(value = "members/farmers/my-farm/horses", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "말 정보 등록")
    public BaseResponse<Void> updateHorse(@AuthenticationPrincipal CustomUserDetails user,
                                          @ModelAttribute HorseInfoUpdateDto dto) {
        manageFarmService.updateHorse(user.getMemberUuid(), dto);
        return new BaseResponse<>();
    }

    @DeleteMapping(value = "members/farmers/my-farm/horses/{horseNumber}")
    @Operation(summary = "말 삭제")
    public BaseResponse<Void> deleteHorse(@AuthenticationPrincipal CustomUserDetails user,
                                          @PathVariable Long horseNumber,
                                          @RequestParam String farmUuid) {
        manageFarmService.softDeleteHorse(user.getMemberUuid(), horseNumber, farmUuid);
        return new BaseResponse<>();
    }

    @GetMapping("members/farmers/my-farm/horses")
    @Operation(summary = "말 목록 조회")
    public BaseResponse<List<HorseListResponseDto>> getHorseList(@AuthenticationPrincipal CustomUserDetails user,
                                                                 @RequestParam String farmUuid) {
        return new BaseResponse<>(manageFarmService.getHorseList(user.getMemberUuid(), farmUuid));
    }

    @GetMapping("/farms/{farmUuid}/location")
    @Operation(summary = "목장 주소의 위도, 경도 조회")
    public BaseResponse<GeoDto> getGeo(@PathVariable String farmUuid) {
        return new BaseResponse<>(manageFarmService.getGeo(farmUuid));
    }

    @PostMapping(value = "/members/farms/{farmUuid}/horses/{horseNumber}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "말 관리 상태 업로드(content는 필수 값 아님)")
    public Mono<BaseResponse<String>> reportHorseState(@AuthenticationPrincipal CustomUserDetails user,
                                                       @PathVariable String farmUuid,
                                                       @PathVariable Long horseNumber,
                                                       @ModelAttribute ReportHorseStatusDto dto) {

        return manageFarmService.reportHorseState(user.getMemberUuid(), farmUuid, horseNumber, dto)
                .map(BaseResponse::new);
    }

}
