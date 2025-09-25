package com.e105.majoong.mypage.service;

import com.e105.majoong.mypage.dto.out.BookmarkResponseDto;
import com.e105.majoong.mypage.dto.out.DonationHistoryDetailResponseDto;
import com.e105.majoong.mypage.dto.out.DonationResponseDto;
import java.time.LocalDate;
import java.util.List;

public interface DonatorMyPageService {

    //후원 상세 내역 조회
    //내 지갑 조회
    DonationResponseDto getDonationHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate);

    List<BookmarkResponseDto> getBookmarks(String memberUuid);

    void createBookmarks(String memberUuid, String farmUuid);

    void deleteBookmarks(String memberUuid, String farmUuid);

    DonationHistoryDetailResponseDto getDonationHistoryDetail(String memberUuid, Long donationHistoryId);

}
