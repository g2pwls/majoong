package com.e105.majoong.auth.service;

import com.e105.majoong.auth.dto.in.SignUpCompleteRequestDto;
import com.e105.majoong.auth.dto.out.AuthSignInResponseDto;
import com.e105.majoong.blockchain.service.VaultService;
import com.e105.majoong.blockchain.service.WalletService;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.jwt.JwtTokenProvider;
import com.e105.majoong.common.redis.RedisService;
import com.e105.majoong.common.model.donator.Donator;
import com.e105.majoong.common.model.farmer.Farmer;
import com.e105.majoong.common.model.oAuthMember.OauthMember;
import com.e105.majoong.common.model.oAuthMember.Role;
import com.e105.majoong.finance.service.FinApiServiceImpl;
import com.e105.majoong.common.model.donator.DonatorRepository;
import com.e105.majoong.common.model.farmer.FarmerRepository;
import com.e105.majoong.common.model.oAuthMember.OauthMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.crypto.Hash;
import org.web3j.utils.Numeric;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

  private final RedisService redisService;
  private final OauthMemberRepository memberRepository;
  private final JwtTokenProvider jwtTokenProvider;
  private final FarmerRepository farmerRepository;
  private final DonatorRepository donatorRepository;

  // 블록체인 연동
  private final WalletService walletService;
  private final VaultService vaultService;
  private final FinApiServiceImpl finApiService;

  @Transactional
  public AuthSignInResponseDto signInWithSessionKey(String sessionKey) {

    if (sessionKey == null || sessionKey.isBlank()) {
      throw new BaseException(BaseResponseStatus.NO_SIGN_IN);
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> cached = (Map<String, Object>) redisService.get(sessionKey);
    if (cached == null) {
      throw new BaseException(BaseResponseStatus.TOKEN_NOT_VALID);
    }

    String oauthId = (String) cached.get("oauthId");
    String provider = (String) cached.getOrDefault("provider", "KAKAO");
    String email = (String) cached.get("email");

    Optional<OauthMember> opt = memberRepository.findByOauthIdAndOauthProvider(oauthId, provider);
    if (opt.isPresent()) {
      OauthMember m = opt.get();
      String memberUuid = m.getMemberUuid();
      if("farmer".equalsIgnoreCase(m.getRole().name())){
        email = farmerRepository.findEmailByMemberUuid(memberUuid)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
      }else{
        email = donatorRepository.findEmailByMemberUuid(memberUuid)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
      }

      String accessToken = jwtTokenProvider.generateAccessToken(memberUuid, m.getRole().name());
      String refreshToken = jwtTokenProvider.generateRefreshToken(memberUuid, m.getRole().name());
      long ttlSec = TimeUnit.MILLISECONDS.toSeconds(jwtTokenProvider.getRefreshExpireTime());
      redisService.set("rt:" + memberUuid, refreshToken, ttlSec);

      redisService.delete("sess:" + sessionKey);

      return AuthSignInResponseDto.ofLogin(memberUuid, accessToken, refreshToken, email, m.getRole());
    }

    String tempAccessToken = jwtTokenProvider.generateTempAccessToken(oauthId, email, provider);
    return AuthSignInResponseDto.ofSignUp("TEMP:" + oauthId, tempAccessToken, email);
  }

  @Transactional
  public AuthSignInResponseDto completeSignUp(String memberUuid, SignUpCompleteRequestDto req) {
    OauthMember oauth;

    // 신규 가입자면 TEMP 토큰을 정식 사용자로 전환
    if (memberUuid.startsWith("TEMP:")) {
      String oauthId = memberUuid.substring(5);
      String provider = "KAKAO";

      Optional<OauthMember> existing = memberRepository.findByOauthIdAndOauthProvider(oauthId, provider);
      if (existing.isPresent()) {
        throw new BaseException(BaseResponseStatus.DUPLICATED_USER);
      }
      oauth = OauthMember.builder()
          .memberUuid(UUID.randomUUID().toString())
          .oauthId(oauthId)
          .oauthProvider(provider)
          .role(req.getRole())
          .build();

      memberRepository.save(oauth);
      memberUuid = oauth.getMemberUuid();
    } else {
      oauth = memberRepository.findByMemberUuid(memberUuid)
          .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_SIGN_IN));
    }

    // ───────── 역할 분기 ─────────
    if ("farmer".equalsIgnoreCase(req.getRole().name())) {
      // 1) 기본 정보 저장
      Farmer farmer = farmerRepository.save(req.toFarmer(memberUuid));

      // 2) 서버 보관형 지갑 생성 → 주소/keystore 암호문 저장
      // 금융 API
      var created = walletService.createCustodialWallet();
      farmer.updateWalletAddress(created.address());
      farmer.updateKeystoreCipher(created.keystoreCipher());

      var finMember = finApiService.registerMember(req.getEmail());
      var account = finApiService.createDemandDepositAccount(finMember.getUserKey());
      farmer.updateFinAccount(finMember.getUserKey(), account.getRec().getAccountNo());

      farmerRepository.save(farmer);

      // 3) farmId 계산 (임시: memberUuid → keccak → uint256)
      var farmId = toUint256FromMemberUuid(memberUuid);

      // 4) Vault 생성(관리자 서명) + DB 저장(farm_vaults)
      var fv = vaultService.createVaultAndPersist(farmId, created.address(), memberUuid);
      log.info("Vault created & persisted: memberUuid={}, farmId={}, vault={}, tx={}",
          memberUuid, farmId, fv.getVaultAddress(), fv.getDeployTxHash());

    } else if ("donator".equalsIgnoreCase(req.getRole().name())) {
      // 1) 기본 정보 저장
      Donator donator = donatorRepository.save(req.toDonator(memberUuid));

      // 2) 서버 보관형 지갑 생성 → 주소/keystore 암호문 저장
      var created = walletService.createCustodialWallet();
      donator.updateWalletAddress(created.address());
      donator.updateKeystoreCipher(created.keystoreCipher());
      donatorRepository.save(donator);

    } else {
      throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
    }
    // ───────── 역할 분기 끝 ─────────

    oauth.updateRole(req.getRole());

    String accessToken = jwtTokenProvider.generateAccessToken(memberUuid, req.getRole().name());
    String refreshToken = jwtTokenProvider.generateRefreshToken(memberUuid, req.getRole().name());
    long ttlSec = TimeUnit.MILLISECONDS.toSeconds(jwtTokenProvider.getRefreshExpireTime());
    redisService.set("rt:" + memberUuid, refreshToken, ttlSec);

    return AuthSignInResponseDto.ofLogin(memberUuid, accessToken, refreshToken, req.getEmail(), req.getRole());
  }

  @Transactional
  public AuthSignInResponseDto refreshToken(String refreshToken) {
    if (!jwtTokenProvider.isTokenValid(refreshToken)) {
      throw new BaseException(BaseResponseStatus.TOKEN_NOT_VALID);
    }

    String memberUuid = jwtTokenProvider.getMemberUuid(refreshToken);
    String role = jwtTokenProvider.getRole(refreshToken);

    Object value = redisService.get("rt:" + memberUuid);
    if (value == null) {
      throw new BaseException(BaseResponseStatus.INVALID_REFRESH_TOKEN);
    }
    String stored = value.toString();
    if (!stored.equals(refreshToken)) {
      throw new BaseException(BaseResponseStatus.INVALID_REFRESH_TOKEN);
    }

    String newAccess = jwtTokenProvider.generateAccessToken(memberUuid, role);
    String newRefresh = jwtTokenProvider.generateRefreshToken(memberUuid, role);

    long ttlSec = TimeUnit.MILLISECONDS.toSeconds(jwtTokenProvider.getRefreshExpireTime());
    redisService.set("rt:" + memberUuid, newRefresh, ttlSec);

    return AuthSignInResponseDto.ofRefresh(memberUuid, newAccess, newRefresh, Role.valueOf(role.toUpperCase()));
  }

  /** memberUuid 문자열을 keccak 해시로 uint256 변환 (임시 구현) */ //todo
  private static java.math.BigInteger toUint256FromMemberUuid(String memberUuid) {
    if (memberUuid == null || memberUuid.isBlank()) {
      throw new IllegalArgumentException("memberUuid is required for farmer");
    }
    String hex = Numeric.cleanHexPrefix(Hash.sha3String(memberUuid));
    return new java.math.BigInteger(hex, 16);
  }
}
