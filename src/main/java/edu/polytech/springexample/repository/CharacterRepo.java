package edu.polytech.springexample.repository;

import edu.polytech.springexample.model.FictionalCharacter;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CharacterRepo extends JpaRepository<FictionalCharacter, Long> {
    FictionalCharacter findByLastname(String lastname);
    FictionalCharacter findByunivers(String univers);
}
