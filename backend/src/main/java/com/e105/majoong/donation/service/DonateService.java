// src/main/java/com/e105/majoong/donation/service/DonateService.java
package com.e105.majoong.donation.service;

import com.e105.majoong.blockchain.props.ChainProps;
import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farmVault.FarmVaultRepository;
import com.e105.majoong.blockchain.service.OnChainDonationService;
import com.e105.majoong.blockchain.util.TokenUnits;
import com.e105.majoong.common.model.donationHistory.DonationHistory;
import com.e105.majoong.common.model.donationHistory.DonationHistoryRepository;
import com.e105.majoong.common.model.donator.Donator;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.farmVault.FarmVault;
import com.e105.majoong.donation.dto.in.DonationRequestDto;
import com.e105.majoong.donation.dto.out.DonationResponseDto;
import com.e105.majoong.common.model.donator.DonatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DonateService {

  private final FarmRepository farmRepo;
  private final FarmVaultRepository vaultRepo;
  private final DonatorRepository donatorRepo;
  private final DonationHistoryRepository historyRepo;

  private final OnChainDonationService onChain;
  private final ChainProps chainProps;

  @Transactional
  public DonationResponseDto donate(DonationRequestDto req) throws Exception {
    long unit = chainProps.getKrwPerToken(); // 1000
    long krw  = req.getAmountKrw();

    // 1000원 단위 정책(정수 토큰)
    long tokenCount = TokenUnits.krwToMaronTokensExact(krw, unit);
    BigInteger amountWei = TokenUnits.maronTokensToWei(tokenCount);

    // 1) 목장주 memberUuid로 Farm 조회 → farmUuid 확보
    Farm farm = farmRepo.findByMemberUuid(req.getFarmMemberUuid())
        .orElseThrow(() -> new IllegalArgumentException("farm not found by memberUuid: " + req.getFarmMemberUuid()));

    // 2) 목장 금고 조회 (목장주 기준 최신/ACTIVE)
    FarmVault vault = vaultRepo.findTopByMemberUuidOrderByIdDesc(req.getFarmMemberUuid())
        .orElseThrow(() -> new IllegalStateException("vault not found for member: " + req.getFarmMemberUuid()));

    // 3) 기부자 지갑 조회 (donator.member_uuid == req.memberUuid)
    Donator donator = donatorRepo.findByMemberUuid(req.getMemberUuid())
        .orElseThrow(() -> new IllegalStateException("donor wallet not found: " + req.getMemberUuid()));

    // 4) 온체인 민팅 → txHash 획득
    String txHash = onChain.mintToVaultForDonor(donator.getWalletAddress(), vault.getVaultAddress(), amountWei);

    // 5) 누적: DB는 “정수 토큰 개수” 기준
    long current = farm.getTotalDonation() == null ? 0L : farm.getTotalDonation();
    farm.updateTotalDonation(current + tokenCount);

    // 6) donation_history 저장 (farmUuid + tx_hash)
    DonationHistory h = new DonationHistory();
    h.updateDonationDate(LocalDateTime.now());
    h.updateDonationToken(tokenCount);
    h.updateDonatorUuid(req.getMemberUuid());      // 기부자
    h.updateFarmUuid(farm.getFarmUuid());
    h.updateFarmerUuid(farm.getMemberUuid());// 목장 저장
    h.updateTxHash(txHash);
    historyRepo.save(h);

    return new DonationResponseDto(
        txHash,
        req.getMemberUuid(),
        vault.getVaultAddress(),
        String.valueOf(tokenCount),
        amountWei.toString()
    );
  }
}
