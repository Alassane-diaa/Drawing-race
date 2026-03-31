package com.projetase.drawing.controller;

import com.projetase.drawing.model.*;
import com.projetase.drawing.service.PredictionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    public PredictionController(PredictionService service) {
        this.predictionService = service;
    }

    @PostMapping("/process")
    public ResponseEntity<PredictionResponse> process(@RequestBody Stroke stroke) {
        System.out.println("Stroke received with " + stroke.getPoints().size() + " points");

        try {
            PredictionResponse prediction = predictionService.getPrediction(stroke);
            System.out.println("Prediction: " + prediction);
            return ResponseEntity.ok(prediction);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}



     