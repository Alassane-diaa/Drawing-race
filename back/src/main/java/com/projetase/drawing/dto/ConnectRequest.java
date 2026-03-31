package com.projetase.drawing.dto;

import lombok.Data;


@Data
public class ConnectRequest {
    private String gameId;
    private String playerName;
}