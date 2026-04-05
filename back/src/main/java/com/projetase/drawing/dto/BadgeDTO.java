package com.projetase.drawing.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class BadgeDTO {
    private Long          id;
    private String        name;
    private String        description;
    private LocalDateTime unlockedAt; // null si non débloqué
}
