package com.projetase.drawing.service;

import com.projetase.drawing.GameLogic.randomCategoryService;
import com.projetase.drawing.exception.GameException;
import com.projetase.drawing.model.Game;
import com.projetase.drawing.model.GameStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class GameService {
	private static final int GAME_ID_MIN = 10_000;
	private static final int GAME_ID_MAX_EXCLUSIVE = 1_000_000;
	private static final int GAME_ID_GENERATION_MAX_ATTEMPTS = 1_000;
	private static final int DEFAULT_TOTAL_ROUNDS = 3;
	private static final int DEFAULT_ROUND_DURATION_SEC = 15;
	private static final double DEFAULT_CONFIDENCE_THRESHOLD = 0.9d;
	private static final double DOUBLE_EPSILON = 0.000001d;

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
		Game game = getGameById(gameId);

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
		game.setCurrentRound(1);
		game.setTotalRounds(DEFAULT_TOTAL_ROUNDS);
		game.setPlayer1RoundsWon(0);
		game.setPlayer2RoundsWon(0);
		game.setLastRoundWinnerName(null);
		game.setLastRoundResult(null);
		game.setLastRoundNumber(0);
		game.setMatchWinnerName(null);
		game.setRoundDurationSec(DEFAULT_ROUND_DURATION_SEC);
		game.setConfidenceThreshold(DEFAULT_CONFIDENCE_THRESHOLD);
		startRound(game);
		return game;
	}

	public Game submitPrediction(String gameId, String playerName, String category, double confidence, double targetConfidence) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = getGameById(gameId);

		if (!GameStatus.STARTED.equals(game.getStatus())) {
			throw new GameException("GAME_NOT_STARTED", "La partie n'est pas en cours");
		}

		ensurePlayerInGame(game, normalizedPlayerName);

		if (!game.isRoundActive()) {
			return game;
		}

		if (isRoundExpired(game)) {
			finalizeRound(game, null);
			return game;
		}

		double normalizedConfidence = normalizeConfidence(confidence);
		double normalizedTargetConfidence = normalizeConfidence(targetConfidence);
		if (normalizedPlayerName.equals(game.getPlayer1Name())) {
			game.setPlayer1BestConfidence(Math.max(game.getPlayer1BestConfidence(), normalizedTargetConfidence));
		} else {
			game.setPlayer2BestConfidence(Math.max(game.getPlayer2BestConfidence(), normalizedTargetConfidence));
		}

		if (isWinningPrediction(game, category, normalizedConfidence)) {
			finalizeRound(game, normalizedPlayerName);
		} else if (isRoundExpired(game)) {
			finalizeRound(game, null);
		}

		return game;
	}

	public Game stopMatch(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = getGameById(gameId);

		if (!normalizedPlayerName.equals(game.getPlayer1Name())) {
			throw new GameException("ONLY_HOST_CAN_STOP", "Seul l'hote peut arrêter la partie");
		}

		if (game.getPlayer2Name() == null) {
			throw new GameException("MISSING_PLAYER2", "Impossible d'arrêter sans second joueur");
		}

		game.setStatus(GameStatus.IN_PROGRESS);
		game.setPlayer1Ready(true);
		game.setPlayer2Ready(true);
		game.setRoundActive(false);
		game.setRoundStartedAtMs(0L);
		game.setCurrentRound(0);
		game.setLastRoundNumber(0);
		game.setLastRoundResult(null);
		game.setLastRoundWinnerName(null);
		game.setMatchWinnerName(null);
		game.setTargetCategory(null);
		game.setPlayer1RoundsWon(0);
		game.setPlayer2RoundsWon(0);
		game.setPlayer1BestConfidence(0.0d);
		game.setPlayer2BestConfidence(0.0d);

		return game;
	}

	public Game finishRoundIfExpired(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = getGameById(gameId);

		if (!GameStatus.STARTED.equals(game.getStatus())) {
			throw new GameException("GAME_NOT_STARTED", "La partie n'est pas en cours");
		}

		ensurePlayerInGame(game, normalizedPlayerName);

		if (game.isRoundActive() && isRoundExpired(game)) {
			finalizeRound(game, null);
		}

		return game;
	}

	public Game leaveLobby(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = getGameById(gameId);

		if (!normalizedPlayerName.equals(game.getPlayer2Name())) {
			throw new GameException("ONLY_PLAYER2_CAN_LEAVE", "Seul le joueur 2 peut quitter le lobby");
		}

		game.setPlayer2Name(null);
		game.setPlayer2Ready(false);
		game.setRoundActive(false);
		game.setTargetCategory(null);
		game.setCurrentRound(0);
		game.setLastRoundNumber(0);
		game.setLastRoundResult(null);
		game.setLastRoundWinnerName(null);
		game.setMatchWinnerName(null);
		game.setPlayer1RoundsWon(0);
		game.setPlayer2RoundsWon(0);
		game.setPlayer1BestConfidence(0.0d);
		game.setPlayer2BestConfidence(0.0d);
		game.setStatus(GameStatus.WAITING);
		return game;
	}

	public Game restartMatch(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = getGameById(gameId);

		if (!normalizedPlayerName.equals(game.getPlayer1Name())) {
			throw new GameException("ONLY_HOST_CAN_RESTART", "Seul l'hote peut relancer la partie");
		}

		if (game.getPlayer2Name() == null) {
			throw new GameException("MISSING_PLAYER2", "Impossible de relancer sans second joueur");
		}

		game.setStatus(GameStatus.IN_PROGRESS);
		game.setPlayer1Ready(true);
		game.setPlayer2Ready(true);
		game.setRoundActive(false);
		game.setRoundStartedAtMs(0L);
		game.setCurrentRound(0);
		game.setLastRoundNumber(0);
		game.setLastRoundResult(null);
		game.setLastRoundWinnerName(null);
		game.setMatchWinnerName(null);
		game.setTargetCategory(null);
		game.setPlayer1RoundsWon(0);
		game.setPlayer2RoundsWon(0);
		game.setPlayer1BestConfidence(0.0d);
		game.setPlayer2BestConfidence(0.0d);

		return game;
	}

	public Game deleteLobby(String gameId, String playerName) {
		String normalizedPlayerName = normalizePlayerName(playerName);
		Game game = getGameById(gameId);

		if (!normalizedPlayerName.equals(game.getPlayer1Name())) {
			throw new GameException("ONLY_HOST_CAN_DELETE", "Seul l'hote peut supprimer le lobby");
		}

		games.remove(gameId);
		return game;
	}

	private String normalizePlayerName(String playerName) {
		if (playerName == null || playerName.isBlank()) {
			throw new GameException("INVALID_PLAYER", "playerName est obligatoire");
		}

		return playerName.trim();
	}

	private void ensurePlayerInGame(Game game, String playerName) {
		if (!playerName.equals(game.getPlayer1Name()) && !playerName.equals(game.getPlayer2Name())) {
			throw new GameException("PLAYER_NOT_IN_GAME", "Ce joueur ne fait pas partie de la partie");
		}
	}

	private void startRound(Game game) {
		game.setPlayer1BestConfidence(0.0d);
		game.setPlayer2BestConfidence(0.0d);
		game.setRoundActive(true);
		game.setRoundStartedAtMs(System.currentTimeMillis());
		game.setTargetCategory(loadRandomCategory());
	}

	private boolean isWinningPrediction(Game game, String category, double confidence) {
		if (category == null || category.isBlank() || game.getTargetCategory() == null) {
			return false;
		}

		return game.getTargetCategory().equalsIgnoreCase(category.trim())
				&& confidence >= game.getConfidenceThreshold();
	}

	private boolean isRoundExpired(Game game) {
		long elapsedMs = System.currentTimeMillis() - game.getRoundStartedAtMs();
		return elapsedMs >= (long) game.getRoundDurationSec() * 1000L;
	}

	private void finalizeRound(Game game, String immediateWinnerName) {
		if (!game.isRoundActive()) {
			return;
		}

		String winnerName = immediateWinnerName;
		String roundResult = "RECOGNIZED";

		if (winnerName == null) {
			roundResult = "TIMEOUT";
			double p1 = game.getPlayer1BestConfidence();
			double p2 = game.getPlayer2BestConfidence();
			if (Math.abs(p1 - p2) <= DOUBLE_EPSILON) {
				winnerName = null;
				roundResult = "TIE";
			} else if (p1 > p2) {
				winnerName = game.getPlayer1Name();
			} else {
				winnerName = game.getPlayer2Name();
			}
		}

		if (winnerName != null) {
			if (winnerName.equals(game.getPlayer1Name())) {
				game.setPlayer1RoundsWon(game.getPlayer1RoundsWon() + 1);
			} else if (winnerName.equals(game.getPlayer2Name())) {
				game.setPlayer2RoundsWon(game.getPlayer2RoundsWon() + 1);
			}
		}

		game.setLastRoundWinnerName(winnerName);
		game.setLastRoundResult(roundResult);
		game.setLastRoundNumber(game.getCurrentRound());
		game.setRoundActive(false);

		if (game.getCurrentRound() >= game.getTotalRounds()) {
			game.setStatus(GameStatus.FINISHED);
			if (game.getPlayer1RoundsWon() > game.getPlayer2RoundsWon()) {
				game.setMatchWinnerName(game.getPlayer1Name());
			} else if (game.getPlayer2RoundsWon() > game.getPlayer1RoundsWon()) {
				game.setMatchWinnerName(game.getPlayer2Name());
			} else {
				game.setMatchWinnerName(null);
			}
			return;
		}

		game.setCurrentRound(game.getCurrentRound() + 1);
		startRound(game);
	}

	private String loadRandomCategory() {
		try {
			return randomCategoryService.getRandomCategory();
		} catch (IOException exception) {
			throw new GameException("CATEGORY_LOAD_FAILED", "Impossible de charger une categorie");
		}
	}

	private double normalizeConfidence(double confidence) {
		if (Double.isNaN(confidence) || Double.isInfinite(confidence)) {
			return 0.0d;
		}
		return Math.max(0.0d, Math.min(1.0d, confidence));
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
