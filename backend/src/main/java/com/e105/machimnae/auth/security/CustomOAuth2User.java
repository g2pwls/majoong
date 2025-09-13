package com.e105.machimnae.auth.security;

import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

@Data
public class CustomOAuth2User implements OAuth2User {

    private final Map<String, Object> attributes;
    private final String oauthId;
    private final String email;
    private final String nickname;
    private String memberUuid;
    private String role;

    public CustomOAuth2User(Map<String, Object> attributes) {
        this.attributes = attributes;
        this.oauthId = String.valueOf(attributes.get("id"));

        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        this.email = (String) kakaoAccount.get("email");

        Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
        this.nickname = (String) properties.get("nickname");
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }

    @Override
    public String getName() {
        return this.oauthId;
    }
}