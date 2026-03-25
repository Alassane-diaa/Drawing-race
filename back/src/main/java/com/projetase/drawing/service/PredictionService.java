

package com.projetase.drawing.service;

import com.projetase.drawing.model.PredictionResponse;
import com.projetase.drawing.model.Stroke;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class PredictionService {

    private final RestTemplate restTemplate;
    private final String PYTHON_API_URL = "http://python-ml:5000/predict";

    public PredictionService() {
        this.restTemplate = new RestTemplate();
    }

    public PredictionResponse getPrediction(Stroke stroke) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Stroke> request = new HttpEntity<>(stroke, headers);
            
            ResponseEntity<PredictionResponse> response = restTemplate.postForEntity(
                PYTHON_API_URL, 
                request, 
                PredictionResponse.class
            );
            
            return response.getBody();
            
        } catch (Exception e) {
            System.err.println("Error calling Python API: " + e.getMessage());
            throw new RuntimeException("Failed to get prediction from AI model", e);
        }
    }
}
