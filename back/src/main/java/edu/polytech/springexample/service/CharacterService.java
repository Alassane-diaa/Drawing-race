package edu.polytech.springexample.service;

import edu.polytech.springexample.model.FictionalCharacter;
import edu.polytech.springexample.repository.CharacterRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CharacterService {

    private final CharacterRepo repository;

    public CharacterService(CharacterRepo repository) {
        this.repository = repository;
    }

    public FictionalCharacter saveFictionalCharacter(FictionalCharacter character) {
        return repository.save(character);
    }

    public List<FictionalCharacter> saveFictionalCharacters(List<FictionalCharacter> characters) {
        return repository.saveAll(characters);
    }

    public List<FictionalCharacter> getFictionalCharacters() {
        return repository.findAll();
    }

    public FictionalCharacter getFictionalCharacterById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public FictionalCharacter getFictionalCharacterByName(String lastname) {
        return repository.findByLastname(lastname);
    }

    public FictionalCharacter getFictionalCharacterByUnivers(String univers){
        return repository.findByunivers(univers);
    }

    public String deleteFictionalCharacter(Long id) {
        repository.deleteById(id);
        return "character removed !! " + id;
    }

    public FictionalCharacter updateFictionalCharacter(FictionalCharacter character) {
        FictionalCharacter existingFictionalCharacter = repository.findById(character.getId()).orElse(null);
        assert existingFictionalCharacter != null;
        existingFictionalCharacter.setFirstname(character.getFirstname());
        existingFictionalCharacter.setLastname(character.getLastname());
        existingFictionalCharacter.setUnivers(character.getUnivers());
        return repository.save(existingFictionalCharacter);
    }
    
}
