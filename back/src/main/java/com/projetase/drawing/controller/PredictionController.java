package com.projetase.drawing.controller;

import com.projetase.drawing.model.*;
import com.projetase.drawing.service.PredictionService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin
@RestController
public class PredictionController {

    private final PredictionService service;

    public PredictionController(PredictionService service) {
        this.service = service;
    }

    @PostMapping("/process")
    public String process(@RequestBody Stroke stroke) {
        return "Stroke reçue : " + stroke.getPoints().toString();
        //return service.predict(character);
    }


}
     