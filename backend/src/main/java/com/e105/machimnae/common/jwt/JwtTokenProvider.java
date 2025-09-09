package com.e105.machimnae.common.jwt;

import com.e105.machimnae.common.entity.BaseResponseStatus;
import com.e105.machimnae.common.exception.BaseException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.core.env.Environment;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtTokenProvider {

    //    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
    private final Environment env;
    private final UserDetailsService userDetailsService;

    public String generateAccessToken(String memberUUID) {

        Claims claims = Jwts.claims().subject(memberUUID).build();
        Date now = new Date();
        Date expiration = new Date(now.getTime() + env.getProperty("jwt.access-expire-time", Long.class).longValue());

        return Jwts.builder()
                .signWith(getSignKey())
                .claim("memberUUID", claims.getSubject())
                .setExpiration(expiration)
                .compact();

    }

    public String generateRefreshToken(Authentication authentication) {

        Claims claims = Jwts.claims().subject(authentication.getName()).build();
        Date now = new Date();
        Date expiration = new Date(now.getTime() + env.getProperty("jwt.refresh-expire-time", Long.class).longValue());

        return Jwts.builder()
                .signWith(getSignKey())
                .claim("email", claims.getSubject())
                .issuedAt(expiration)
                .compact();
    }

    public Key getSignKey() {
        return Keys.hmacShaKeyFor(env.getProperty("jwt.secret-key").getBytes());
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getMemberUUID(String token) throws BaseException {
        try {
            token = token.replace("Bearer ", "");
            Claims claims = getClaims(token);
            token = claims.get("memberUUID", String.class);
            return token;
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

}