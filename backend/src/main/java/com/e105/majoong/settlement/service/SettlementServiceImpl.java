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
import com.e105.majoong.settlement.dto.in.ReceiptSettlementRequest;
import com.e105.majoong.settlement.dto.out.ReceiptSettlementResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

  private final VaultService vaultService;
  private final FarmRepository farmRepository;
  private final FarmVaultRepository farmVaultRepository;
  private final FarmerRepository farmerRepository;
  private final SettlementHistoryRepository historyRepository;
  private final ChainProps chainProps;

  @Override
  @Transactional
  public ReceiptSettlementResponse settle(String memberUuid, ReceiptSettlementRequest req) {
    // ── (0) 기본 유효성 ───────────────────────────────────────────────────
    if(memberUuid==null || memberUuid.isBlank()){
      throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
    }
    if(req.getIdempotencyKey()==null || req.getIdempotencyKey().isBlank()){
      throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
    }
    if(historyRepository.existsByEvidenceId(req.getIdempotencyKey())){
      throw new BaseException(BaseResponseStatus.SETTLEMENT_ALREADY_PROCESSED);
    }
    if(req.getTotalAmount()==null || req.getTotalAmount()<=0){
      throw new BaseException(BaseResponseStatus.INVALID_AMOUNT);
    }

    // ── (1) 활성 금고 조회 (memberUuid 기준) ──────────────────────────────
    FarmVault vault=farmVaultRepository
        .findTopByMemberUuidAndStatusOrderByIdDesc(memberUuid, FarmVault.Status.ACTIVE)
        .orElseThrow(()->new BaseException(BaseResponseStatus.NO_ACTIVE_FARM_VAULT));
    String vaultAddress=vault.getVaultAddress();

    // ── (2) 목장주 지갑 ───────────────────────────────────────────────────
    Farmer farmer=farmerRepository.findByMemberUuid(memberUuid)
        .orElseThrow(()->new BaseException(BaseResponseStatus.NO_EXIST_USER));
    String farmerWallet=farmer.getWalletAddress();
    if(farmerWallet==null || farmerWallet.isBlank()){
      throw new BaseException(BaseResponseStatus.INVALID_WALLET_ADDRESS);
    }

    // ── (3) 이력 표기용 farmUuid ────────────────────────────────────
    Farm farm = farmRepository.findTopByMemberUuidOrderByIdDesc(memberUuid)
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
    String farmUuid = farm.getFarmUuid();

    // ── (4) 금액 변환: KRW → 토큰 → wei ─────────────────────────────────
    long krwPerToken=chainProps.getKrwPerToken();
    long krw=req.getTotalAmount().longValue();
    long tokenCount=TokenUnits.krwToMaronTokensExact(krw, krwPerToken);
    BigInteger tokenWei=TokenUnits.maronTokensToWei(tokenCount);
    String tokenHuman=TokenUnits.maronTokensToString(tokenCount);

    // ── (5) 체인 출금 ────────────────────────────────────────────────────
    String txHash;
    try{
      txHash=vaultService.release(vaultAddress, farmerWallet, tokenWei);
    }catch(Exception e){
      log.error("Settlement release failed (vault={}, to={}, wei={})",
          vaultAddress, farmerWallet, tokenWei, e);

      historyRepository.save(
          SettlementHistory.failed(
              farmUuid,
              req.getIdempotencyKey(),
              farmerWallet,
              vaultAddress,
              tokenHuman,
              shorten(e.getMessage())
          )
      );
      throw new BaseException(BaseResponseStatus.SETTLEMENT_RELEASE_FAILED);
    }

    // ── (6) farm DB에 used_amount 누적 ───────────────────────────────────────
    farm.updateUsedAmount(krw);

    // ── (7) 성공 이력 저장 ───────────────────────────────────────────────
    historyRepository.save(
        SettlementHistory.released(
            farmUuid,
            req.getIdempotencyKey(),
            farmerWallet,
            vaultAddress,
            tokenHuman,
            txHash
        )
    );

    // ── (8) 응답 ─────────────────────────────────────────────────────────
    return ReceiptSettlementResponse.ok(txHash, farmerWallet, vaultAddress, tokenHuman);
  }

  private static String shorten(String s){
    if(s==null) return null;
    final int MAX=180;
    return s.length()<=MAX? s: s.substring(0,MAX);
  }
}
