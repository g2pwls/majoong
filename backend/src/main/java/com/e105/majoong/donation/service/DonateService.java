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
  public DonationResponseDto donate(DonationRequestDto req, String memberUuid) throws Exception {
    long unit = chainProps.getKrwPerToken();
    long krw  = req.getAmountKrw();

    // 1000원 단위 정책(정수 토큰)
    long tokenCount = TokenUnits.krwToMaronTokensExact(krw, unit);
    BigInteger amountWei = TokenUnits.maronTokensToWei(tokenCount);

    // 1) farmUuid로 Farm 조회
    Farm farm = farmRepo.findByFarmUuid(req.getFarmUuid())
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));

    // 2) farmUuid로 금고 조회 (farm_vaults.farm_id == farm.farm_uuid)
    FarmVault vault = vaultRepo.findTopByFarmUuidOrderByIdDesc(req.getFarmUuid())
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM_VAULT));

    // 3) 기부자 지갑 조회 (donator.member_uuid == req.memberUuid)
    Donator donator = donatorRepo.findByMemberUuid(memberUuid)
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_DONATOR));

    // 4) 온체인 민팅 → txHash 획득
    String txHash = onChain.mintToVaultForDonor(donator.getWalletAddress(), vault.getVaultAddress(), amountWei);

    // 5) 누적: DB는 “원화 금액” 기준
    farm.updateTotalDonation(krw);   // 토큰 개수 대신 원화 금액 누적
    Long balance = farm.getTotalDonation() - farm.getUsedAmount();
    // 6) donation_history 저장 (farmUuid + tx_hash)
    DonationHistory h = req.toEntity(
        farm.getFarmUuid(),
        farm.getMemberUuid(),
        memberUuid,
        txHash,
        tokenCount,
        balance
    );
    historyRepo.save(h);

    return new DonationResponseDto(
        txHash,
        memberUuid,
        vault.getVaultAddress(),
        String.valueOf(tokenCount),
        amountWei.toString()
    );
  }
}
