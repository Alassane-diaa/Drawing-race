package edu.polytech.springexample.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.polytech.springexample.model.FictionalCharacter;
import edu.polytech.springexample.repository.CharacterRepo;
import edu.polytech.springexample.service.CharacterService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CharacterControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CharacterService service;

    @SuppressWarnings("unused")
    @MockBean
    private CharacterRepo characterRepo;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void addCharacter_shouldReturnCharacter() throws Exception {
        FictionalCharacter character =
                new FictionalCharacter(1L, "Harry", "Potter", "Hogwarts");

        Mockito.when(service.saveFictionalCharacter(Mockito.any(FictionalCharacter.class)))
                .thenReturn(character);

        mockMvc.perform(post("/addCharacter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(character)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstname").value("Harry"))
                .andExpect(jsonPath("$.lastname").value("Potter"));
    }

    @Test
    void addCharacters_shouldReturnCharacterList() throws Exception {
        FictionalCharacter c1 =
                new FictionalCharacter(1L, "Harry", "Potter", "Hogwarts");
        FictionalCharacter c2 =
                new FictionalCharacter(2L, "Hermione", "Granger", "Hogwarts");

        List<FictionalCharacter> characters = Arrays.asList(c1, c2);

        Mockito.when(service.saveFictionalCharacters(Mockito.anyList()))
                .thenReturn(characters);

        mockMvc.perform(post("/addCharacters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(characters)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].firstname").value("Harry"))
                .andExpect(jsonPath("$[1].firstname").value("Hermione"));
    }

    @Test
    void findAllCharacters_shouldReturnList() throws Exception {
        FictionalCharacter character =
                new FictionalCharacter(1L, "Harry", "Potter", "Hogwarts");

        Mockito.when(service.getFictionalCharacters())
                .thenReturn(List.of(character));

        mockMvc.perform(get("/characters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstname").value("Harry"));
    }

    @Test
    void findCharacterById_shouldReturnCharacter() throws Exception {
        FictionalCharacter character =
                new FictionalCharacter(1L, "Harry", "Potter", "Hogwarts");

        Mockito.when(service.getFictionalCharacterById(1L))
                .thenReturn(character);

        mockMvc.perform(get("/characterById/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstname").value("Harry"))
                .andExpect(jsonPath("$.lastname").value("Potter"));
    }

    @Test
    void findCharacterByName_shouldReturnCharacter() throws Exception {
        FictionalCharacter character =
                new FictionalCharacter(1L, "Harry", "Potter", "Hogwarts");

        Mockito.when(service.getFictionalCharacterByName("Harry"))
                .thenReturn(character);

        mockMvc.perform(get("/character/{name}", "Harry"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstname").value("Harry"));
    }

    @Test
    void updateCharacter_shouldReturnUpdatedCharacter() throws Exception {
        FictionalCharacter updated =
                new FictionalCharacter(1L, "Harry", "Weasley", "Hogwarts");

        Mockito.when(service.updateFictionalCharacter(Mockito.any(FictionalCharacter.class)))
                .thenReturn(updated);

        mockMvc.perform(put("/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastname").value("Weasley"));
    }

    @Test
    void deleteCharacter_shouldReturnMessage() throws Exception {
        Mockito.when(service.deleteFictionalCharacter(1L))
                .thenReturn("Character deleted");

        mockMvc.perform(delete("/delete/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(content().string("Character deleted"));
    }
}
