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
	private Instant createdAt = Instant.now();
}
