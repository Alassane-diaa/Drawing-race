package com.projetase.drawing.GameLogic;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class randomCategoryService {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Random random = new Random();

    public static String getRandomCategory() throws IOException {
        try (InputStream inputStream = randomCategoryService.class.getClassLoader().getResourceAsStream("categories.json")) {
            if (inputStream == null) {
                throw new IOException("Le fichier categories.json est introuvable dans les resources backend.");
            }

            JsonNode rootNode = objectMapper.readTree(inputStream);
            List<String> categories = new ArrayList<>();

            rootNode.forEach(node -> categories.add(node.asText()));

            return categories.get(random.nextInt(categories.size()));
        }
    }
}
