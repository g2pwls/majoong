// src/main/java/com/e105/majoong/donation/controller/DonateController.java
package com.e105.majoong.donation.controller;

import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.donation.dto.in.DonationRequestDto;
import com.e105.majoong.donation.dto.out.DonationResponseDto;
import com.e105.majoong.donation.service.DonateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/donation")
public class DonateController {

  private final DonateService donateService;

  @PostMapping
  public BaseResponse<DonationResponseDto> donate(@Valid @RequestBody DonationRequestDto req) throws Exception {
    return new BaseResponse<>(donateService.donate(req));
  }
}
