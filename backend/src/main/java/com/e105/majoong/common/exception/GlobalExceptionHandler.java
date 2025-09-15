package com.e105.majoong.common.exception;

import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.common.entity.BaseResponseStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<BaseResponse> handleBaseException(BaseException e) {
        BaseResponseStatus status = e.getStatus();
        return new ResponseEntity<>(new BaseResponse(status), status.getHttpStatusCode());
    }
}