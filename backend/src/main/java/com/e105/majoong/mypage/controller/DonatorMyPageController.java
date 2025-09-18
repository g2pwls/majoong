package com.e105.majoong.mypage.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.mypage.dto.out.BookmarkResponseDto;
import com.e105.majoong.mypage.dto.out.DonationHistoryDetailResponseDto;
import com.e105.majoong.mypage.dto.out.DonationResponseDto;
import com.e105.majoong.mypage.service.DonatorMyPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/api/v1/members/donators")
@Tag(name = "Donater MyPage API", description = "기부자 마이페이지 API")
public class DonatorMyPageController {

    private final DonatorMyPageService donatorMyPageService;

    @GetMapping("/donations?page={page}&size={size}&startDate={startDate}&endDate={endDate}")
    @Operation(summary = "기부 내역 조회(시작 날짜와 끝 날짜를 지정해서 조회 가능)")
    public BaseResponse<DonationResponseDto> getDonations(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return new BaseResponse<>(donatorMyPageService.getDonationHistoryByPage(
                user.getMemberUuid(), page, size, startDate, endDate));
    }

    @GetMapping("/bookmarks")
    @Operation(summary = "즐겨찾기 목록 조회")
    public BaseResponse<List<BookmarkResponseDto>> getBookmarks(@AuthenticationPrincipal CustomUserDetails user) {
        return new BaseResponse<>(donatorMyPageService.getBookmarks(user.getMemberUuid()));
    }

    @PostMapping("/bookmarks/farms/{farmUuid}")
    @Operation(summary = "즐겨찾기 생성")
    public BaseResponse<Void> createBookmarks(@AuthenticationPrincipal CustomUserDetails user,
                                              @PathVariable String farmUuid) {
        return new BaseResponse<>();
    }

    @GetMapping("/donations/{donationHistoryId}")
    @Operation(summary = "기부 상세 조회")
    public BaseResponse<DonationHistoryDetailResponseDto> getDonationHistoryDetail(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long donationHistoryId) {
        return new BaseResponse<>(
                donatorMyPageService.getDonationHistoryDetail(user.getMemberUuid(), donationHistoryId));
    }

}
