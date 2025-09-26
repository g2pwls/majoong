package com.e105.majoong.auth.controller;

import com.e105.majoong.auth.dto.in.RefreshTokenRequest;
import com.e105.majoong.auth.dto.in.SignUpCompleteRequestDto;
import com.e105.majoong.auth.dto.out.AuthSignInResponseDto;
import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.auth.service.AuthService;
import com.e105.majoong.common.entity.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth API", description = "로그인 API")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/sign-in")
    @Operation(summary = "로그인/회원가입 분기처리")
    public BaseResponse<AuthSignInResponseDto> signIn(
            @CookieValue(name = "session_key", required = false) String sessionKey
    ) {
        AuthSignInResponseDto result = authService.signInWithSessionKey(sessionKey);
        return new BaseResponse<>(result);
    }

    @PostMapping("/signup-complete")
    @Operation(summary = "회원가입")
    public BaseResponse<AuthSignInResponseDto> signUpComplete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody SignUpCompleteRequestDto req
    ) {
        AuthSignInResponseDto result = authService.completeSignUp(user.getMemberUuid(), req);
        return new BaseResponse<>(result);
    }

    @PostMapping("/token/refresh")
    @Operation(summary = "refresh token 재발급")
    public ResponseEntity<AuthSignInResponseDto> refresh(@RequestBody RefreshTokenRequest request) {
        AuthSignInResponseDto response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/qr-login")
    @Operation(summary = "QR 자동 로그인")
    public BaseResponse<AuthSignInResponseDto> qrLogin(@RequestParam String token) {
        AuthSignInResponseDto result = authService.qrLogin(token);
        return new BaseResponse<>(result);
    }
}