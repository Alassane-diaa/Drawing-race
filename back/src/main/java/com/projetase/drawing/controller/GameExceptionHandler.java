package com.projetase.drawing.controller;

import com.projetase.drawing.dto.ApiError;
import com.projetase.drawing.exception.GameException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GameExceptionHandler {

    @ExceptionHandler(GameException.class)
    public ResponseEntity<ApiError> handleGameException(GameException e) {
        ApiError apiError = ApiError.builder()
                .code(e.getCode())
                .message(e.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiError);
    }
}

