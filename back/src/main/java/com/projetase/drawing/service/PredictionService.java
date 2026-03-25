

package com.projetase.drawing.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projetase.drawing.model.PredictionResponse;
import com.projetase.drawing.model.Stroke;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class PredictionService {

    private final RestTemplate restTemplate;
    private final String PYTHON_API_URL = "http://localhost:5000/predict";

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

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    public String getRandomCategory() throws IOException {

        File jsonFile = new File("python/categories.json");

        if (!jsonFile.exists()) {
            jsonFile = new File("../python/categories.json");
        }

        if (!jsonFile.exists()) {
            throw new IOException("Le fichier categories.json est introuvable à : " + jsonFile.getAbsolutePath());
        }

        // Lecture du JSON
        JsonNode rootNode = objectMapper.readTree(jsonFile);
        List<String> categories = new ArrayList<>();

        rootNode.forEach(node -> categories.add(node.asText()));
        System.out.println(random.nextInt(categories.size()));

        return categories.get(random.nextInt(categories.size()));
    }

}
