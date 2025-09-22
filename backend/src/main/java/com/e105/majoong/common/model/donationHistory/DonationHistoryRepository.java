package com.e105.majoong.common.model.donationHistory;

import com.e105.majoong.common.model.donationHistory.DonationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationHistoryRepository extends JpaRepository<DonationHistory, Long>, DonationHistoryRepositoryCustom {
    boolean existsByIdAndDonatorUuid(Long id, String donatorUuid);
}
