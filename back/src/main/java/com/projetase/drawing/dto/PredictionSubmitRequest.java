package com.projetase.drawing.dto;

import lombok.Data;

@Data
public class PredictionSubmitRequest {
    private String playerName;
    private String category;
    private double confidence;
    private double targetConfidence;
}