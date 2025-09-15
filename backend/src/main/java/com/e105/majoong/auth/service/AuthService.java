package com.e105.majoong.auth.service;

import com.e105.majoong.auth.dto.in.SignUpCompleteRequestDto;
import com.e105.majoong.auth.dto.out.AuthSignInResponseDto;
import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import com.e105.majoong.common.jwt.JwtTokenProvider;
import com.e105.majoong.common.redis.RedisService;
import com.e105.majoong.member.entity.OauthMember;
import com.e105.majoong.member.entity.Role;
import com.e105.majoong.member.repository.DonatorRepository;
import com.e105.majoong.member.repository.FarmerRepository;
import com.e105.majoong.member.repository.OauthMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public AuthSignInResponseDto signInWithSessionKey(String sessionKey) {

        if (sessionKey == null || sessionKey.isBlank()) {
            throw new BaseException(BaseResponseStatus.NO_SIGN_IN);
        }

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

            String accessToken = jwtTokenProvider.generateAccessToken(m.getMemberUuid(), m.getRole().name());
            String refreshToken = jwtTokenProvider.generateRefreshToken(m.getMemberUuid(), m.getRole().name());
            long ttlSec = TimeUnit.MILLISECONDS.toSeconds(jwtTokenProvider.getRefreshExpireTime());
            redisService.set("rt:" + m.getMemberUuid(), refreshToken, ttlSec);

            redisService.delete("sess:" + sessionKey);

            return AuthSignInResponseDto.ofLogin(m.getMemberUuid(), accessToken, refreshToken, email);
        }

        String tempAccessToken = jwtTokenProvider.generateTempAccessToken(oauthId, email, provider);

        return AuthSignInResponseDto.ofSignUp("TEMP:" + oauthId, tempAccessToken, email);
    }

    @Transactional
    public AuthSignInResponseDto completeSignUp(String memberUuid, SignUpCompleteRequestDto req) {
        OauthMember oauth = null;
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
                    .role(Role.valueOf(req.getRole().toUpperCase()))
                    .build();

            memberRepository.save(oauth);

            memberUuid = oauth.getMemberUuid();
        }

        if ("farmer".equalsIgnoreCase(req.getRole())) {
            farmerRepository.save(req.toFarmer(memberUuid));
        } else if ("donator".equalsIgnoreCase(req.getRole())) {
            donatorRepository.save(req.toDonator(memberUuid));
        } else {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }

        oauth.setRole(Role.valueOf(req.getRole().toUpperCase()));

        String accessToken = jwtTokenProvider.generateAccessToken(memberUuid, req.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(memberUuid, req.getRole());

        long ttlSec = TimeUnit.MILLISECONDS.toSeconds(jwtTokenProvider.getRefreshExpireTime());
        redisService.set("rt:" + memberUuid, refreshToken, ttlSec);

        return AuthSignInResponseDto.ofLogin(memberUuid, accessToken, refreshToken, req.getEmail());
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
        if (stored == null || !stored.equals(refreshToken)) {
            throw new BaseException(BaseResponseStatus.INVALID_REFRESH_TOKEN);
        }

        String newAccess = jwtTokenProvider.generateAccessToken(memberUuid, role);
        String newRefresh = jwtTokenProvider.generateRefreshToken(memberUuid, role);

        long ttlSec = TimeUnit.MILLISECONDS.toSeconds(jwtTokenProvider.getRefreshExpireTime());
        redisService.set("rt:" + memberUuid, newRefresh, ttlSec);

        return AuthSignInResponseDto.ofRefresh(memberUuid, newAccess, newRefresh);
    }
}
