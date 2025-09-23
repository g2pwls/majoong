package com.e105.majoong.receipt.service;

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
import com.e105.majoong.common.model.receiptDetailHistory.ReceiptDetailHistory;
import com.e105.majoong.common.model.receiptDetailHistory.ReceiptDetailHistoryRepository;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistory;
import com.e105.majoong.common.model.receiptHistory.ReceiptHistoryRepository;
import com.e105.majoong.common.model.settlementHistory.SettlementHistory;
import com.e105.majoong.common.model.settlementHistory.SettlementHistoryRepository;
import com.e105.majoong.receipt.dto.in.ReceiptSettlementRequestDto;
import com.e105.majoong.receipt.dto.out.ReceiptSettlementResponseDto;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiptSettlementServiceImpl implements ReceiptSettlementService {

  private final VaultService vaultService;
  private final FarmRepository farmRepository;
  private final FarmVaultRepository farmVaultRepository;
  private final FarmerRepository farmerRepository;
  private final SettlementHistoryRepository historyRepository;
  private final ChainProps chainProps;
  private final com.e105.majoong.common.utils.S3Uploader s3Uploader;
  private final ReceiptHistoryRepository receiptHistoryRepository;
  private final ReceiptDetailHistoryRepository receiptDetailHistoryRepository;
  private static final String RECEIPT_IMAGE_DIR = "receipt";

  @Override
  @Transactional
  public ReceiptSettlementResponseDto settle(String memberUuid, ReceiptSettlementRequestDto req, MultipartFile photo) {

    // ── (0) 기본/멱등 검증 ─────────────────────────────────────────
    if (memberUuid == null || memberUuid.isBlank())
      throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);

    if (req.getIdempotencyKey() == null || req.getIdempotencyKey().isBlank())
      throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);

    if (historyRepository.existsByEvidenceId(req.getIdempotencyKey()))
      throw new BaseException(BaseResponseStatus.SETTLEMENT_ALREADY_PROCESSED);

    if (req.getItems() == null || req.getItems().isEmpty())
      throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);


    if (req.getReceiptAmount() == null || req.getReceiptAmount() <= 0)
      throw new BaseException(BaseResponseStatus.INVALID_AMOUNT);

    long krw = req.getReceiptAmount();
    log.info("settle request by memberUuid={}", memberUuid);
    // ── (1) 활성 금고/지갑/팜 조회 ─────────────────────────────────────
    FarmVault vault = farmVaultRepository
        .findTopByMemberUuidAndStatusOrderByIdDesc(memberUuid, FarmVault.Status.ACTIVE)
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_ACTIVE_FARM_VAULT));
    String vaultAddress = vault.getVaultAddress();

    Farmer farmer = farmerRepository.findByMemberUuid(memberUuid)
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_USER));
    String farmerWallet = farmer.getWalletAddress();
    if (farmerWallet == null || farmerWallet.isBlank())
      throw new BaseException(BaseResponseStatus.INVALID_WALLET_ADDRESS);

    Farm farm = farmRepository.findTopByMemberUuidOrderByIdDesc(memberUuid)
        .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_FARM));
    String farmUuid = farm.getFarmUuid();

    // ── (2) 영수증 저장 ───────────────────────────────────────────────
    final String content = truncate1k(req.getContent());

    //photourl s3 주소로 바꿔서 저장
    String photoUrl = null;
    try {
      if (photo != null && !photo.isEmpty()) {
        photoUrl = s3Uploader.upload(photo, RECEIPT_IMAGE_DIR);
      } else {
        photoUrl = req.getPhotoUrl();
      }
    } catch (IOException e) {
      throw new BaseException(BaseResponseStatus.S3_UPLOAD_FAILED);
    }
    if (photoUrl == null || photoUrl.isBlank()) {
      throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
    }
    ReceiptHistory receipt = ReceiptHistory.builder()
        .farmUuid(farmUuid)
        .memberUuid(memberUuid)
        .storeName(req.getStoreInfo().getName())
        .storeAddress(req.getStoreInfo().getAddress())
        .storeNumber(req.getStoreInfo().getPhone())
        .totalAmount((int) krw)
        .photoUrl(photoUrl)
        .aiSummary(req.getReason())
        .content(content)
        .categoryId(req.getCategoryId())
        .build();

    receiptHistoryRepository.save(receipt);

    // 상세 저장
    req.getItems().forEach(it -> {
      ReceiptDetailHistory d = ReceiptDetailHistory.builder()
          .receiptHistory(receipt)      // FK
          .itemName(it.getName())
          .quantity(it.getQuantity())
          .pricePerItem(it.getUnitPrice())
          .build();
      receiptDetailHistoryRepository.save(d);
    });

    // ── (3) KRW → 토큰 ──────────────────────────────────────────
    long krwPerToken = chainProps.getKrwPerToken();
    if (krwPerToken <= 0) throw new BaseException(BaseResponseStatus.INVALID_AMOUNT);

    long tokenCount = TokenUnits.krwToMaronTokensExact(krw, krwPerToken);
    BigInteger tokenWei = TokenUnits.maronTokensToWei(tokenCount);
    String tokenHuman = TokenUnits.maronTokensToString(tokenCount);

    // ── (4) 체인 출금 ────────────────────────────────────────────────
    String txHash;
    try {
      txHash = vaultService.release(vaultAddress, farmerWallet, tokenWei);
    } catch (Exception e) {
      log.error("Settlement release failed (vault={}, to={}, wei={})",
          vaultAddress, farmerWallet, tokenWei, e);

      historyRepository.save(SettlementHistory.failed(
          farmUuid, req.getIdempotencyKey(), farmerWallet, vaultAddress, tokenHuman, shorten(e.getMessage())));
      throw new BaseException(BaseResponseStatus.SETTLEMENT_RELEASE_FAILED);
    }

    // ── (5) 사용금액 누적 + 성공 이력 ────────────────────────────────
    farm.updateUsedAmount(krw);

    historyRepository.save(SettlementHistory.released(
        farmUuid, req.getIdempotencyKey(), farmerWallet, vaultAddress, tokenHuman, txHash));

    // ── (6) 응답 ─────────────────────────────────────────────────────
    return ReceiptSettlementResponseDto.ok(txHash, farmerWallet, vaultAddress, tokenHuman);
  }

  // 최대 1,000자 자르기
  private static String truncate1k(String s) {
    if (s == null) return null;
    return s.length() <= 1000 ? s : s.substring(0, 1000);
  }

  private static String shorten(String s){
    if(s==null) return null;
    final int MAX=180;
    return s.length()<=MAX? s: s.substring(0,MAX);
  }
}
