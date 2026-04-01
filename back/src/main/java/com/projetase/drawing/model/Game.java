package com.projetase.drawing.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Game {
	private String id;
	private String player1Name;
	private String player2Name;
	private GameStatus status;
	@Builder.Default
	private boolean player1Ready = false;
	@Builder.Default
	private boolean player2Ready = false;
	@Builder.Default
	private int currentRound = 0;
	@Builder.Default
	private int totalRounds = 3;
	@Builder.Default
	private int player1RoundsWon = 0;
	@Builder.Default
	private int player2RoundsWon = 0;
	@Builder.Default
	private boolean roundActive = false;
	@Builder.Default
	private long roundStartedAtMs = 0L;
	@Builder.Default
	private int roundDurationSec = 15;
	@Builder.Default
	private double confidenceThreshold = 0.9d;
	private String targetCategory;
	@Builder.Default
	private double player1BestConfidence = 0.0d;
	@Builder.Default
	private double player2BestConfidence = 0.0d;
	private String lastRoundWinnerName;
	private String lastRoundResult;
	@Builder.Default
	private int lastRoundNumber = 0;
	private String matchWinnerName;
	@Builder.Default
	private Instant createdAt = Instant.now();
}
