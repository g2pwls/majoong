package com.e105.majoong.common.jwt;

import com.e105.majoong.common.entity.BaseResponseStatus;
import com.e105.majoong.common.exception.BaseException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.access-expire-time}")
    private long accessExpireTime;

    @Value("${jwt.refresh-expire-time}")
    private long refreshExpireTime;

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateAccessToken(String memberUUID, String role) {
        return Jwts.builder()
                .signWith(getSignKey())
                .claim("memberUUID", memberUUID)
                .claim("role", role)
                .setExpiration(new Date(System.currentTimeMillis() + accessExpireTime))
                .compact();
    }

    public String generateRefreshToken(String memberUUID, String role) {
        return Jwts.builder()
                .signWith(getSignKey())
                .claim("memberUUID", memberUUID)
                .claim("role", role)
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpireTime))
                .compact();
    }

    public long getRefreshExpireTime() {
        return refreshExpireTime;
    }

    public boolean isTokenValid(String token) throws BaseException {
        try {
            Jwts.parser()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("만료된 토큰입니다");
            throw new BaseException(BaseResponseStatus.WRONG_JWT_TOKEN);
        } catch (UnsupportedJwtException e) {
            log.error("지원되지 않는 유형의 토큰입니다");
            throw new BaseException(BaseResponseStatus.WRONG_JWT_TOKEN);
        } catch (MalformedJwtException | IllegalArgumentException e) {
            log.error("잘못된 토큰입니다");
            throw new BaseException(BaseResponseStatus.WRONG_JWT_TOKEN);
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.error("SecretKey가 일치하지 않습니다");
            throw new BaseException(BaseResponseStatus.WRONG_JWT_TOKEN);
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getMemberUuid(String token) {
        return getClaims(token).get("memberUUID", String.class);
    }

    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public String generateTempAccessToken(String oauthId, String email, String provider) {
        long thirtyMinutes = TimeUnit.MINUTES.toMillis(30);

        return Jwts.builder()
                .signWith(getSignKey())
                .claim("memberUUID", "TEMP:" + oauthId)
                .claim("role", "TEMP")
                .claim("scope", "SIGNUP")
                .claim("oauthId", oauthId)
                .claim("provider", provider)
                .claim("email", email)
                .setExpiration(new Date(System.currentTimeMillis() + thirtyMinutes))
                .compact();
    }
}