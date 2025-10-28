package com.runigen.meeoocat.advice;

import com.runigen.meeoocat.constant.ErrorCode;
import com.runigen.meeoocat.exception.MeeoocatException;
import com.runigen.meeoocat.vo.ErrorResponse;
import jakarta.persistence.EntityExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalControllerAdvice {
    @ExceptionHandler(value = MeeoocatException.class)
    public ResponseEntity entityExistsException(MeeoocatException e){
        ErrorResponse response = new ErrorResponse(e.getErrorCode());
        Map<String, Object> result = new HashMap<String, Object>();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
