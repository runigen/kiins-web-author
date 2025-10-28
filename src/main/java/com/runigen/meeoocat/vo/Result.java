package com.runigen.meeoocat.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
@AllArgsConstructor
@Builder
public class Result<T> {
    private int code;
    private String message;
    private T data;

    public Result(final HttpStatus statusCode, final String message) {
        this.code = statusCode.value();
        this.message = message;
        this.data = null;
    }

    public static<T> Result<T> res(final HttpStatus statusCode) {
        return res(statusCode, statusCode.getReasonPhrase(), null);
    }

    public static<T> Result<T> res(final HttpStatus statusCode, final T t) {
        return res(statusCode, statusCode.getReasonPhrase(), t);
    }

    public static<T> Result<T> res(final HttpStatus statusCode, final String responseMessage) {
        return res(statusCode, responseMessage, null);
    }

    public static<T> Result<T> res(final HttpStatus statusCode, final String responseMessage, final T t) {
        return Result.<T>builder()
                .data(t)
                .code(statusCode.value())
                .message(responseMessage)
                .build();
    }
}
