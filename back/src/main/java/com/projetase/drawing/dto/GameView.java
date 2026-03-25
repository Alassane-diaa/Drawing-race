package com.projetase.drawing.dto;

import com.projetase.drawing.model.Game;
import com.projetase.drawing.model.GameStatus;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class GameView {
    String gameId;
    String player1Name;
    String player2Name;
    GameStatus status;

    public static GameView from(Game game) {
        return GameView.builder()
                .gameId(game.getId())
                .player1Name(game.getPlayer1Name())
                .player2Name(game.getPlayer2Name())
                .status(game.getStatus())
                .build();
    }
}

