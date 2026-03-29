package com.projetase.drawing.GameLogic;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class randomCategoryService {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Random random = new Random();

    public static String getRandomCategory() throws IOException {

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

        return categories.get(random.nextInt(categories.size()));
    }
}
