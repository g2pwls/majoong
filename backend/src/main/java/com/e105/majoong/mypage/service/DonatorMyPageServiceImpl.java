package com.e105.majoong.mypage.service;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.bookmark.BookmarkRepository;
import com.e105.majoong.common.model.bookmark.BookmarkRepositoryCustom;
import com.e105.majoong.common.model.donationHistory.DonationHistoryRepositoryCustom;
import com.e105.majoong.common.model.donator.DonatorRepository;
import com.e105.majoong.mypage.dto.in.BookmarkRequestDto;
import com.e105.majoong.mypage.dto.out.BookmarkResponseDto;
import com.e105.majoong.mypage.dto.out.DonationHistoryDetailResponseDto;
import com.e105.majoong.mypage.dto.out.DonationResponseDto;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DonatorMyPageServiceImpl implements DonatorMyPageService {

    private final DonationHistoryRepositoryCustom donationHistoryRepositoryCustom;
    private final DonatorRepository donatorRepository;
    private final BookmarkRepositoryCustom bookmarkRepositoryCustom;
    private final BookmarkRepository bookmarkRepository;

    @Override
    public DonationResponseDto getDonationHistoryByPage(
            String memberUuid, int page, int size, LocalDate startDate, LocalDate endDate) {
        if (!donatorRepository.existsByMemberUuid(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
        }
        return donationHistoryRepositoryCustom
                .findDonationHistoryByPage(page, size, startDate, endDate);
    }

    @Override
    public List<BookmarkResponseDto> getBookmarks(String memberUuid) {
        if (!donatorRepository.existsByMemberUuid(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
        }
        return bookmarkRepositoryCustom.findBookmarks(memberUuid);
    }

    @Override
    public void createBookmarks(String memberUuid, String farmUuid) {
        if (!donatorRepository.existsByMemberUuid(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
        }

        bookmarkRepository.save(BookmarkRequestDto.toEntity(memberUuid, farmUuid));
    }

    @Override
    public DonationHistoryDetailResponseDto getDonationHistoryDetail(String memberUuid, Long donationHistoryId) {
        if (!donatorRepository.existsByMemberUuid(memberUuid)) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY);
        }

        return donationHistoryRepositoryCustom.findDonationHistoryDetail(memberUuid, donationHistoryId);
    }


}
