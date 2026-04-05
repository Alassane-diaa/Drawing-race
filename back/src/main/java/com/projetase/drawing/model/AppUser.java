package com.projetase.drawing.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.jdbc.Expectation;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String username;
    private String password;
    private String role;

    //Les stats et la pp + un rang comme sur LOL (jsp si c'est bien)
    private int gamesPlayed;
    private int wins;
    private float accuracy;
    private String rank;
    private String avatarFilename; //on ne stocke pas l'image mais juste le chemin vers le fichier

}

