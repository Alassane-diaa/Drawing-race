package edu.polytech.springexample.controller;

import edu.polytech.springexample.model.FictionalCharacter;
import edu.polytech.springexample.service.CharacterService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin
@RestController
public class CharacterController {

    private final CharacterService service;

    public CharacterController(CharacterService service) {
        this.service = service;
    }

    @PostMapping("/addCharacter")
    public FictionalCharacter addCharacter(@RequestBody FictionalCharacter character) {
        return service.saveFictionalCharacter(character);
    }

    @PostMapping("/addCharacters")
    public List<FictionalCharacter> addCharacters(@RequestBody List<FictionalCharacter> characters) {
        return service.saveFictionalCharacters(characters);
    }

    @GetMapping("/characters")
    public List<FictionalCharacter> findAllCharacters() {
        return service.getFictionalCharacters();
    }

    @GetMapping("/characterById/{id}")
    public FictionalCharacter findCharacterById(@PathVariable("id") Long id) {
        return service.getFictionalCharacterById(id);
    }

    @GetMapping("/character/{name}")
    public FictionalCharacter findCharacterByName(@PathVariable("name") String name) {
        return service.getFictionalCharacterByName(name);
    }

    @GetMapping("characterByUnivers/{univers}")
    public FictionalCharacter findCharacterByUnivers(@PathVariable("univers") String univers) {
        return service.getFictionalCharacterByUnivers(univers);
    }

    @PutMapping("/update")
    public FictionalCharacter updateCharacter(@RequestBody FictionalCharacter character) {
        return service.updateFictionalCharacter(character);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteCharacter(@PathVariable("id") Long id) {
        return service.deleteFictionalCharacter(id);
    }
}
     