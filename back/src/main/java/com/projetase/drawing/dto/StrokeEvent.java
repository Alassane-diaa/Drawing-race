package com.projetase.drawing.dto;

import com.projetase.drawing.model.Stroke;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StrokeEvent {
    private String gameId;
    private String playerName;
    private Long timestamp;
    private Stroke stroke;
}

