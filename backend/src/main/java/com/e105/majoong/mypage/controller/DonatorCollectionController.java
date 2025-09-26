package com.e105.majoong.mypage.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.mypage.dto.in.DonatorCardCreateDto;
import com.e105.majoong.mypage.dto.out.BookmarkResponseDto;
import com.e105.majoong.mypage.dto.out.HorseInFarmResponseDto;
import com.e105.majoong.mypage.service.DonatorCollectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/api/v1/members/donators")
@Tag(name = "CollectionCard API", description = "카드 collection API")
public class DonatorCollectionController {
    private final DonatorCollectionService donatorCollectionService;

    @GetMapping("/farms/{farmUuid}")
    @Operation(summary = "기부 후 농장에 있는 말 목록 조회")
    public BaseResponse<List<HorseInFarmResponseDto>> getHorsesByDonator(@AuthenticationPrincipal CustomUserDetails user,
                                                                         @PathVariable String farmUuid) {
        return new BaseResponse<>(donatorCollectionService.getHorsesByDonator(user.getMemberUuid(), farmUuid));
    }

    @GetMapping("/collections")
    @Operation(summary = "회원 카드 목록 조회")
    public BaseResponse<List<HorseInFarmResponseDto>> getCollectionList(@AuthenticationPrincipal CustomUserDetails user,
                                                                        @RequestParam String farmUuid) {
        return new BaseResponse<>(donatorCollectionService.getCollectionList(user.getMemberUuid(), farmUuid));
    }

    @PostMapping("/collections")
    @Operation(summary = "회원 카드 저장")
    public BaseResponse<Void> createCollection(@AuthenticationPrincipal CustomUserDetails user,
                                               @RequestBody DonatorCardCreateDto dto) {
        donatorCollectionService.createCollection(user.getMemberUuid(), dto);
        return new BaseResponse<>();
    }

}
