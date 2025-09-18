package com.e105.majoong.common.model.oAuthMember;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    FARMER,
    DONATOR,
    PENDING;

    @JsonCreator
    public static Role from(String value) {
        try {
            return Role.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            return PENDING;
        }
    }
}