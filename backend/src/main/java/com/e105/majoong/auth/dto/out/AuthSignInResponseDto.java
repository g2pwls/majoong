package com.e105.majoong.auth.dto.out;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthSignInResponseDto {
    @JsonProperty("signUp")
    private boolean isSignUp;
    private String accessToken;
    private String refreshToken;
    private String tempAccessToken;
    private String memberUuid;
    private String email;

    public static AuthSignInResponseDto ofSignUp(String memberUuid, String tempAccessToken, String email) {
        return AuthSignInResponseDto.builder()
                .isSignUp(true)
                .memberUuid(memberUuid)
                .tempAccessToken(tempAccessToken)
                .email(email)
                .build();
    }

    public static AuthSignInResponseDto ofLogin(String memberUuid, String accessToken, String refreshToken, String email) {
        return AuthSignInResponseDto.builder()
                .isSignUp(false)
                .memberUuid(memberUuid)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(email)
                .build();
    }

    public static AuthSignInResponseDto ofRefresh(String memberUuid, String accessToken, String refreshToken) {
        return AuthSignInResponseDto.builder()
                .isSignUp(false)
                .memberUuid(memberUuid)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

}
