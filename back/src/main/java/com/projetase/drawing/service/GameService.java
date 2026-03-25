package com.projetase.drawing.service;

import com.projetase.drawing.exception.GameException;
import com.projetase.drawing.model.Game;
import com.projetase.drawing.model.GameStatus;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

	private final Map<String, Game> games = new ConcurrentHashMap<>();

	public Game createGame(String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);

		Game game = Game.builder()
				.id(UUID.randomUUID().toString())
				.player1Name(normalizedPlayerName)
				.status(GameStatus.WAITING)
				.build();

		games.put(game.getId(), game);
		return game;
	}

	public Game connectToGame(String playerName, String gameId) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = games.get(gameId);
		if (game == null) {
			throw new GameException("GAME_NOT_FOUND", "Partie introuvable: " + gameId);
		}

		if (game.getPlayer2Name() != null) {
			throw new GameException("GAME_FULL", "Partie deja complete");
		}

		if (normalizedPlayerName.equals(game.getPlayer1Name())) {
			throw new GameException("PLAYER_ALREADY_IN_GAME", "Le createur ne peut pas se reconnecter comme second joueur");
		}

		game.setPlayer2Name(normalizedPlayerName);
		game.setStatus(GameStatus.IN_PROGRESS);
		return game;
	}

	public Game connectToRandomGame(String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Optional<Game> gameOpt = games.values().stream()
				.filter(game -> GameStatus.WAITING.equals(game.getStatus()))
				.filter(game -> game.getPlayer2Name() == null)
				.filter(game -> !normalizedPlayerName.equals(game.getPlayer1Name()))
				.findFirst();

		if (gameOpt.isPresent()) {
			return connectToGame(normalizedPlayerName, gameOpt.get().getId());
		}

		return createGame(normalizedPlayerName);
	}

	public Game validateStrokeSender(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = games.get(gameId);
		if (game == null) {
			throw new GameException("GAME_NOT_FOUND", "Partie introuvable: " + gameId);
		}

		if (!GameStatus.IN_PROGRESS.equals(game.getStatus())) {
			throw new GameException("GAME_NOT_READY", "La partie n'est pas encore en cours");
		}

		if (!normalizedPlayerName.equals(game.getPlayer1Name()) && !normalizedPlayerName.equals(game.getPlayer2Name())) {
			throw new GameException("PLAYER_NOT_IN_GAME", "Ce joueur ne fait pas partie de la partie");
		}

		return game;
	}

	private String normalizePlayerName(String playerName) {
		if (playerName == null || playerName.isBlank()) {
			throw new GameException("INVALID_PLAYER", "playerName est obligatoire");
		}

		return playerName.trim();
	}
}
