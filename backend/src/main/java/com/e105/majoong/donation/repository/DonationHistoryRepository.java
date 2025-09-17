package com.e105.majoong.donation.repository;

import com.e105.majoong.common.domain.DonationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationHistoryRepository extends JpaRepository<DonationHistory, Long> { }
