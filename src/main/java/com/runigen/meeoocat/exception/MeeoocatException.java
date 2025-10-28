package com.runigen.meeoocat.exception;

import com.runigen.meeoocat.constant.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class MeeoocatException extends RuntimeException{
    private final ErrorCode errorCode;
}
