package com.e105.majoong.mypage.controller;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.finance.service.FinApiService;
import com.e105.majoong.mypage.dto.out.AccountHistoryResponseDto;
import com.e105.majoong.mypage.dto.out.VaultResponseDto;
import com.e105.majoong.mypage.service.FarmerMyPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/api/v1/members/farmers")
@Tag(name = "Member API", description = "회원관리 API")
public class FarmerMyPageController {

    private final FinApiService finApiService;
    private final FarmerMyPageService farmerMyPageService;

    @GetMapping("/accountHistory")
    @Operation(summary = "계좌 거래 내역(출금만)")
    public BaseResponse<AccountHistoryResponseDto> getAccountHistory(
            @AuthenticationPrincipal CustomUserDetails user) {

        AccountHistoryResponseDto dto = finApiService.inquireTransactionHistoryList(user.getMemberUuid());
        return new BaseResponse<>(dto);
    }

    @GetMapping("/farm/existence")
    @Operation(summary = "목장주 목장 생성 여부 조회")
    public BaseResponse<Boolean> checkCreateFarm(
            @AuthenticationPrincipal CustomUserDetails user) {
        return new BaseResponse<>(farmerMyPageService.checkCreateFarm(user.getMemberUuid()));
    }

    @GetMapping("/donations")
    @Operation(summary = "목장주 금고 기부 내역 조회(시작 날짜와 끝 날짜를 지정해서 조회 가능)")
    public BaseResponse<VaultResponseDto> getVaultHistory(@AuthenticationPrincipal CustomUserDetails user,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size,
                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return new BaseResponse<>(farmerMyPageService.getVaultHistoryByPage(
                user.getMemberUuid(), page, size, startDate, endDate));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "목장주 회원 정보 변경")
    public BaseResponse<Void> updateFarmers(@AuthenticationPrincipal CustomUserDetails user,
                                            @RequestPart(required = false) String farmName,
                                            @RequestPart(required = false) String phoneNumber,
                                            @RequestPart(required = false) MultipartFile image) {
        farmerMyPageService.updateFarmers(user.getMemberUuid(), farmName, phoneNumber, image);
        return new BaseResponse<>();
    }
}
