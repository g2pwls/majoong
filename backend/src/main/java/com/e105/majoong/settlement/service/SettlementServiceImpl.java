package com.e105.majoong.settlement.service;

import com.e105.majoong.blockchain.props.ChainProps;
import com.e105.majoong.blockchain.service.VaultService;
import com.e105.majoong.blockchain.util.TokenUnits;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.model.farm.Farm;
import com.e105.majoong.common.model.farm.FarmRepository;
import com.e105.majoong.common.model.farmVault.FarmVault;
import com.e105.majoong.common.model.farmVault.FarmVaultRepository;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import com.e105.majoong.common.model.settlementHistory.SettlementHistory;
import com.e105.majoong.common.model.settlementHistory.SettlementHistoryRepository;
import com.e105.majoong.settlement.dto.in.ReceiptEvidenceRequest;
import com.e105.majoong.settlement.dto.out.ReceiptSettlementResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

  private final EvidenceVerificationService evidenceVerificationService;
  private final VaultService vaultService;
  private final FarmRepository farmRepository;
  private final FarmVaultRepository farmVaultRepository;
  private final FarmerRepository farmerRepository;
  private final SettlementHistoryRepository historyRepository;

  private final ChainProps chainProps;

  @Override
  public ReceiptSettlementResponse settle(String farmUuid, ReceiptEvidenceRequest req) {
    // ── (0) 기본 유효성 검사 ─────────────────────────────────────────────
    if (farmUuid == null || farmUuid.isBlank()) {
      throw new BaseException(BaseResponseStatus.INVALID_FARM_UUID);
    }
    if (req.getEvidenceId() != null && historyRepository.existsByEvidenceId(req.getEvidenceId())) {
      throw new BaseException(BaseResponseStatus.SETTLEMENT_ALREADY_PROCESSED);
    }
    if (req.getTotalAmount() == null || req.getTotalAmount() <= 0) {
      throw new BaseException(BaseResponseStatus.INVALID_AMOUNT);
    }

    // ── (1) 증빙 검증(현재 스텁/또는 외부검증) ────────────────────────────
    if (!evidenceVerificationService.verify(req)) {
      throw new BaseException(BaseResponseStatus.EVIDENCE_INVALID);
    }

    // ── (2) farmUuid → memberUuid 조회 ─────────────────────────────────
    Farm farm = farmRepository.findByFarmUuid(farmUuid)
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
    String memberUuid = farm.getMemberUuid();

    // ── (3) 활성(ACTIVE) 금고 조회 ─────────────────────────────────────
    FarmVault vault = farmVaultRepository
        .findTopByMemberUuidAndStatusOrderByIdDesc(memberUuid, FarmVault.Status.ACTIVE)
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_ACTIVE_FARM_VAULT));
    String vaultAddress = vault.getVaultAddress();

    // ── (4) 목장주 지갑 조회 ───────────────────────────────────────────
    Farmer farmer = farmerRepository.findByMemberUuid(memberUuid)
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));
    String farmerWallet = farmer.getWalletAddress();
    if (farmerWallet == null || farmerWallet.isBlank()) {
      throw new BaseException(BaseResponseStatus.INVALID_WALLET_ADDRESS);
    }

    // ── (5) 금액 변환: 원화 → (정책)정수 토큰 → wei ─────────────────────
    long krwPerToken = chainProps.getKrwPerToken(); // 예: 1000
    long krw = req.getTotalAmount();                // 영수증 총액(원)
    // 정책 검증 + 변환 (DonateService와 동일 유틸)
    long tokenCount = TokenUnits.krwToMaronTokensExact(krw, krwPerToken);
    BigInteger tokenWei = TokenUnits.maronTokensToWei(tokenCount);
    String tokenHuman = TokenUnits.maronTokensToString(tokenCount); // 표시용

    // ── (6) 체인 출금 ──────────────────────────────────────────────────
    String txHash;
    try {
      txHash = vaultService.release(vaultAddress, farmerWallet, tokenWei);
    } catch (Exception e) {
      log.error("Settlement release failed (vault={}, to={}, wei={})",
          vaultAddress, farmerWallet, tokenWei, e);

      // 실패 이력 저장(사유 단문 저장)
      historyRepository.save(
          SettlementHistory.toEntity(
              farmUuid, farmerWallet, vaultAddress, req,
              tokenHuman, "FAILED", null, shorten(e.getMessage())
          )
      );
      throw new BaseException(BaseResponseStatus.SETTLEMENT_RELEASE_FAILED);
    }

    // ── (7) 성공 이력 저장 ─────────────────────────────────────────────
    historyRepository.save(
        SettlementHistory.toEntity(
            farmUuid, farmerWallet, vaultAddress, req,
            tokenHuman, "RELEASED", txHash, null
        )
    );

    // ── (8) 응답 ───────────────────────────────────────────────────────
    return ReceiptSettlementResponse.ok(txHash, farmerWallet, vaultAddress, tokenHuman);
  }

  // 예외 메시지 너무 길 경우 failReason에 저장할 짧은 문자열로 컷팅
  private static String shorten(String s) {
    if (s == null) return null;
    final int MAX = 180; // DB 칼럼 길이에 맞춰 조정
    return s.length() <= MAX ? s : s.substring(0, MAX);
  }
}
