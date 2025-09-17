package com.e105.majoong.common.config;

import com.e105.majoong.auth.security.CustomOAuth2User;
import com.e105.majoong.common.redis.RedisService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class KakaoLoginRedirectHandler implements AuthenticationSuccessHandler {

    @Value("${app.redirect-uri}")
    private String redirectUri;

    private final RedisService redisService;
    private final Duration REDIS_EXPIRATION_TIME = Duration.ofMinutes(30); // 30분으로 연장하여 회원가입 시간 확보

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();

        Map<String, String> userInfo = new HashMap<>();
        userInfo.put("oauthId", oauth2User.getOauthId());
        userInfo.put("oauthProvider", "kakao");
        userInfo.put("email", oauth2User.getEmail());

        String sessionKey = UUID.randomUUID().toString();
        redisService.set(sessionKey, userInfo, REDIS_EXPIRATION_TIME.toMillis());

        ResponseCookie cookie = ResponseCookie.from("session_key", sessionKey)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(REDIS_EXPIRATION_TIME)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        response.sendRedirect(redirectUri);
    }
}