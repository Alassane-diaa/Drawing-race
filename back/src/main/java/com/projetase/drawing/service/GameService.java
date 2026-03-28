package com.projetase.drawing.service;

import com.projetase.drawing.exception.GameException;
import com.projetase.drawing.model.Game;
import com.projetase.drawing.model.GameStatus;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class GameService {
	private static final int GAME_ID_MIN = 10_000;
	private static final int GAME_ID_MAX_EXCLUSIVE = 1_000_000;
	private static final int GAME_ID_GENERATION_MAX_ATTEMPTS = 1_000;

	private final Map<String, Game> games = new ConcurrentHashMap<>();

	public Game createGame(String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);

		Game game = Game.builder()
				.id(generateShortGameId())
				.player1Name(normalizedPlayerName)
				.player1Ready(true)
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

	public Game getGameById(String gameId) {
		Game game = games.get(gameId);
		if (game == null) {
			throw new GameException("GAME_NOT_FOUND", "Partie introuvable: " + gameId);
		}

		return game;
	}

	public Game validateStrokeSender(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = games.get(gameId);
		if (game == null) {
			throw new GameException("GAME_NOT_FOUND", "Partie introuvable: " + gameId);
		}

		if (!GameStatus.STARTED.equals(game.getStatus()) && !GameStatus.IN_PROGRESS.equals(game.getStatus())) {
			throw new GameException("GAME_NOT_READY", "La partie n'a pas encore demarre");
		}

		if (!normalizedPlayerName.equals(game.getPlayer1Name()) && !normalizedPlayerName.equals(game.getPlayer2Name())) {
			throw new GameException("PLAYER_NOT_IN_GAME", "Ce joueur ne fait pas partie de la partie");
		}

		return game;
	}

	public Game markPlayerReady(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = games.get(gameId);
		if (game == null) {
			throw new GameException("GAME_NOT_FOUND", "Partie introuvable: " + gameId);
		}

		if (!GameStatus.IN_PROGRESS.equals(game.getStatus())) {
			throw new GameException("GAME_NOT_READY", "La partie n'est pas en attente de joueurs");
		}

		if (normalizedPlayerName.equals(game.getPlayer1Name())) {
			game.setPlayer1Ready(true);
		} else if (normalizedPlayerName.equals(game.getPlayer2Name())) {
			game.setPlayer2Ready(true);
		} else {
			throw new GameException("PLAYER_NOT_IN_GAME", "Ce joueur ne fait pas partie de la partie");
		}

		return game;
	}

	public Game markPlayerNotReady(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = games.get(gameId);
		if (game == null) {
			throw new GameException("GAME_NOT_FOUND", "Partie introuvable: " + gameId);
		}

		if (!GameStatus.IN_PROGRESS.equals(game.getStatus())) {
			throw new GameException("GAME_NOT_READY", "La partie n'est pas en attente de joueurs");
		}

		if (normalizedPlayerName.equals(game.getPlayer1Name())) {
			game.setPlayer1Ready(false);
		} else if (normalizedPlayerName.equals(game.getPlayer2Name())) {
			game.setPlayer2Ready(false);
		} else {
			throw new GameException("PLAYER_NOT_IN_GAME", "Ce joueur ne fait pas partie de la partie");
		}

		return game;
	}

	public Game startGame(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = games.get(gameId);
		if (game == null) {
			throw new GameException("GAME_NOT_FOUND", "Partie introuvable: " + gameId);
		}

		if (!GameStatus.IN_PROGRESS.equals(game.getStatus())) {
			throw new GameException("GAME_NOT_READY", "La partie n'est pas en attente de démarrage");
		}

		if (!normalizedPlayerName.equals(game.getPlayer1Name())) {
			throw new GameException("NOT_PLAYER1", "Seul le créateur peut lancer la partie");
		}

		if (!game.isPlayer1Ready() || !game.isPlayer2Ready()) {
			throw new GameException("PLAYERS_NOT_READY", "Les deux joueurs doivent être prêts");
		}

		game.setStatus(GameStatus.STARTED);
		return game;
	}

	private String normalizePlayerName(String playerName) {
		if (playerName == null || playerName.isBlank()) {
			throw new GameException("INVALID_PLAYER", "playerName est obligatoire");
		}

		return playerName.trim();
	}

	private String generateShortGameId() {
		for (int attempt = 0; attempt < GAME_ID_GENERATION_MAX_ATTEMPTS; attempt++) {
			int value = ThreadLocalRandom.current().nextInt(GAME_ID_MIN, GAME_ID_MAX_EXCLUSIVE);
			String gameId = Integer.toString(value);
			if (!games.containsKey(gameId)) {
				return gameId;
			}
		}

		throw new GameException("GAME_ID_GENERATION_FAILED", "Impossible de generer un id de partie unique");
	}
}
