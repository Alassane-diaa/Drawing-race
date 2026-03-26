package com.projetase.drawing.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class GameEvent {
    String type;
    String gameId;
    String status;
    String joinedPlayerName;
    String targetPlayerName;
    Long timestamp;

    public static GameEvent player2Joined(String gameId, String joinedPlayerName, String targetPlayerName, String status) {
        return GameEvent.builder()
                .type("PLAYER2_JOINED")
                .gameId(gameId)
                .status(status)
                .joinedPlayerName(joinedPlayerName)
                .targetPlayerName(targetPlayerName)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}

