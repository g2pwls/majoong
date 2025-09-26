// src/main/java/com/e105/majoong/donation/service/DonateService.java
package com.e105.majoong.donation.service;

import com.e105.majoong.donation.dto.in.DonationRequestDto;
import com.e105.majoong.donation.dto.out.DonationResponseDto;

public interface DonateService {
  DonationResponseDto donate(DonationRequestDto req, String memberUuid) throws Exception;
}
