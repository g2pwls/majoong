package com.e105.majoong.common.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommonResponseEntity<T> {

    private HttpStatus HttpStatus;
    private boolean isSuccess;
    private String message;
    private T res;

}