package com.projetase.drawing.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ApiError {
    String code;
    String message;
}

