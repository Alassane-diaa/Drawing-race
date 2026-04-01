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
    boolean player1Ready;
    boolean player2Ready;
    int currentRound;
    int totalRounds;
    int player1RoundsWon;
    int player2RoundsWon;
    boolean roundActive;
    long roundStartedAtMs;
    int roundDurationSec;
    double confidenceThreshold;
    String targetCategory;
    double player1BestConfidence;
    double player2BestConfidence;
    String lastRoundWinnerName;
    String lastRoundResult;
    int lastRoundNumber;
    String matchWinnerName;

    public static GameView from(Game game) {
        return GameView.builder()
                .gameId(game.getId())
                .player1Name(game.getPlayer1Name())
                .player2Name(game.getPlayer2Name())
                .status(game.getStatus())
                .player1Ready(game.isPlayer1Ready())
                .player2Ready(game.isPlayer2Ready())
                .currentRound(game.getCurrentRound())
                .totalRounds(game.getTotalRounds())
                .player1RoundsWon(game.getPlayer1RoundsWon())
                .player2RoundsWon(game.getPlayer2RoundsWon())
                .roundActive(game.isRoundActive())
                .roundStartedAtMs(game.getRoundStartedAtMs())
                .roundDurationSec(game.getRoundDurationSec())
                .confidenceThreshold(game.getConfidenceThreshold())
                .targetCategory(game.getTargetCategory())
                .player1BestConfidence(game.getPlayer1BestConfidence())
                .player2BestConfidence(game.getPlayer2BestConfidence())
                .lastRoundWinnerName(game.getLastRoundWinnerName())
                .lastRoundResult(game.getLastRoundResult())
                .lastRoundNumber(game.getLastRoundNumber())
                .matchWinnerName(game.getMatchWinnerName())
                .build();
    }
}

