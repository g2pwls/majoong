package com.e105.majoong.mypage.service;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.mypage.dto.out.VaultResponseDto;
import java.time.LocalDate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;

public interface FarmerMyPageService {
    VaultResponseDto getVaultHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate);

    void updateFarmers(String memberUuid, String farmName, String phoneNumber, MultipartFile image);

    boolean checkCreateFarm(String memberUuid);
}
