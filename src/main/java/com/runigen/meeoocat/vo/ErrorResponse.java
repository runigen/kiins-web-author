package com.runigen.meeoocat.vo;

import com.runigen.meeoocat.constant.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ErrorResponse {
    private int status;
    private String message;
    private HttpStatus code;

    public ErrorResponse(ErrorCode errorCode){
        this.status = errorCode.getStatus();
        this.message = errorCode.getMessage();
        this.code = HttpStatus.valueOf(errorCode.getStatus());
    }
}
