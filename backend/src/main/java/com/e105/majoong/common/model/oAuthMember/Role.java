package com.e105.majoong.common.model.oAuthMember;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    FARMER,
    DONATOR,
    PENDING;

    @JsonCreator
    public static Role from(String value) {
        return Role.valueOf(value.toUpperCase()); // 소문자 → 대문자 변환
    }
}