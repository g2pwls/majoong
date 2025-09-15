package com.e105.majoong.auth.controller;

import com.e105.majoong.auth.dto.in.RefreshTokenRequest;
import com.e105.majoong.auth.dto.in.SignUpCompleteRequestDto;
import com.e105.majoong.auth.dto.out.AuthSignInResponseDto;
import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.auth.service.AuthService;
import com.e105.majoong.common.entity.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/sign-in")
    public BaseResponse<AuthSignInResponseDto> signIn(
            @CookieValue(name = "session_key", required = false) String sessionKey
    ) {
        AuthSignInResponseDto result = authService.signInWithSessionKey(sessionKey);
        return new BaseResponse<>(result);
    }

    @PostMapping("/signup-complete")
    public BaseResponse<AuthSignInResponseDto> signUpComplete(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody SignUpCompleteRequestDto req
    ) {
        AuthSignInResponseDto result = authService.completeSignUp(user.getMemberUuid(), req);
        return new BaseResponse<>(result);
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<AuthSignInResponseDto> refresh(@RequestBody RefreshTokenRequest request) {
        AuthSignInResponseDto response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

}