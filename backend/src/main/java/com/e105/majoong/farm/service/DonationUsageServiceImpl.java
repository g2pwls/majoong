package com.e105.majoong.farm.service;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.receiptDetailHistory.ReceiptDetailHistory;
import com.e105.majoong.common.model.receiptDetailHistory.ReceiptDetailHistoryRepository;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistoryRepository;
import com.e105.majoong.farm.dto.out.UsageDetailResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationUsageServiceImpl implements DonationUsageService {

    private final ReceiptHistoryRepository receiptHistoryRepository;
    private final ReceiptDetailHistoryRepository receiptDetailHistoryRepository;

    public UsageDetailResponseDto getUsageDetail(String farmUuid, Long usageId) {
        ReceiptHistory history = receiptHistoryRepository.findByIdAndFarmUuid(usageId, farmUuid)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM)); //TODO

        List<ReceiptDetailHistory> details = receiptDetailHistoryRepository.findByReceiptHistory(history);

        return UsageDetailResponseDto.fromEntity(history, details);
    }
}