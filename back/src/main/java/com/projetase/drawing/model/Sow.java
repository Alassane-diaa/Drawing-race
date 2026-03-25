package com.projetase.drawing.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Deprecated
public class Sow {
    private String gameId;
    private String playerUsername;
    private Integer x;
    private Integer y;
    private String color;
}

