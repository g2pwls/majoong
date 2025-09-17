package com.e105.majoong.finance.dto.out;

import lombok.Getter;

@Getter
public class FinMemberResponseDto {
    private String userId;
    private String userName;
    private String institutionCode;
    private String userKey;
    private String created;
    private String modified;
}