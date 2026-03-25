package com.projetase.drawing.GameLogic;

import com.projetase.drawing.model.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.io.IOException;
import java.util.Collections;

@CrossOrigin
@RestController
public class RandomCategoryController {


    @GetMapping("/random-category")
    public ResponseEntity<?> getRandomCategory() {
        try {
            String category = randomCategoryService.getRandomCategory();
            System.out.println(ResponseEntity.ok(Collections.singletonMap("category", category)));
            return ResponseEntity.ok(Collections.singletonMap("category", category));
        } catch (IOException e) {
            System.err.println("Erreur categories.json: " + e.getMessage());
            return ResponseEntity.status(500).body("Erreur lors de la lecture des catégories.");
        }
    }

}
