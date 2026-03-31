package com.projetase.drawing.controller;

import com.projetase.drawing.dto.CreateGameRequest;
import com.projetase.drawing.dto.ConnectRequest;
import com.projetase.drawing.dto.GameEvent;
import com.projetase.drawing.dto.GameView;
import com.projetase.drawing.dto.PredictionSubmitRequest;
import com.projetase.drawing.model.Game;
import com.projetase.drawing.model.GameStatus;
import com.projetase.drawing.service.GameService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/game")
@Tag(name = "Multiplayer", description = "Lobby and multiplayer game lifecycle endpoints")
public class MultiplayerController {
    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/create")
    @Operation(summary = "Create lobby")
    public ResponseEntity<GameView> create(@RequestBody CreateGameRequest request) {
        log.info("create game request: {}", request);
        Game game = gameService.createGame(request.getPlayerName());
        GameView gameView = GameView.from(game);
        simpMessagingTemplate.convertAndSend("/topic/game/" + game.getId() + "/state", gameView);
        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/connect")
    @Operation(summary = "Join lobby by game id")
    public ResponseEntity<GameView> connect(@RequestBody ConnectRequest request) {
        log.info("connect request: {}", request);
        Game game = gameService.connectToGame(request.getPlayerName(), request.getGameId());
        GameView gameView = GameView.from(game);
        publishStateAndReadyEvent(game, gameView);
        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/connect/random")
    @Operation(summary = "Join random lobby or create one")
    public ResponseEntity<GameView> connectRandom(@RequestBody CreateGameRequest request) {
        log.info("connect random {}", request);
        Game game = gameService.connectToRandomGame(request.getPlayerName());
        GameView gameView = GameView.from(game);
        publishStateAndReadyEvent(game, gameView);
        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/{gameId}/ready")
    @Operation(summary = "Mark player ready")
    public ResponseEntity<GameView> markReady(@PathVariable String gameId, @RequestBody CreateGameRequest request) {
        log.info("mark ready request: gameId={}, playerName={}", gameId, request.getPlayerName());
        Game game = gameService.markPlayerReady(gameId, request.getPlayerName());
        GameView gameView = GameView.from(game);

        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/state", gameView);
        GameEvent readyEvent = GameEvent.playerReady(gameId, request.getPlayerName());
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/event", readyEvent);

        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/{gameId}/unready")
    @Operation(summary = "Mark player not ready")
    public ResponseEntity<GameView> markNotReady(@PathVariable String gameId, @RequestBody CreateGameRequest request) {
        log.info("mark not ready request: gameId={}, playerName={}", gameId, request.getPlayerName());
        Game game = gameService.markPlayerNotReady(gameId, request.getPlayerName());
        GameView gameView = GameView.from(game);

        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/state", gameView);
        GameEvent readyEvent = GameEvent.playerReady(gameId, request.getPlayerName());
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/event", readyEvent);

        return ResponseEntity.ok(gameView);
    }

    @GetMapping("/{gameId}")
    @Operation(summary = "Get lobby state")
    public ResponseEntity<GameView> getGame(@PathVariable String gameId) {
        log.info("get game request: gameId={}", gameId);
        Game game = gameService.getGameById(gameId);
        return ResponseEntity.ok(GameView.from(game));
    }

    @PostMapping("/{gameId}/start")
    @Operation(summary = "Start game")
    public ResponseEntity<GameView> startGame(@PathVariable String gameId, @RequestBody CreateGameRequest request) {
        log.info("start game request: gameId={}, playerName={}", gameId, request.getPlayerName());
        Game game = gameService.startGame(gameId, request.getPlayerName());
        GameView gameView = GameView.from(game);

        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/state", gameView);
        GameEvent startEvent = GameEvent.gameStarted(gameId);
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/event", startEvent);

        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/{gameId}/prediction")
    @Operation(summary = "Submit prediction result for current round")
    public ResponseEntity<GameView> submitPrediction(@PathVariable String gameId, @RequestBody PredictionSubmitRequest request) {
        log.info("submit prediction: gameId={}, playerName={}, category={}, confidence={}",
                gameId,
                request.getPlayerName(),
                request.getCategory(),
                request.getConfidence());
        Game game = gameService.submitPrediction(
                gameId,
                request.getPlayerName(),
                request.getCategory(),
                request.getConfidence(),
                request.getTargetConfidence()
        );
        GameView gameView = GameView.from(game);
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/state", gameView);
        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/{gameId}/stop")
    @Operation(summary = "Stop current match and return to in-progress lobby")
    public ResponseEntity<GameView> stopMatch(@PathVariable String gameId, @RequestBody CreateGameRequest request) {
        log.info("stop match request: gameId={}, playerName={}", gameId, request.getPlayerName());
        Game game = gameService.stopMatch(gameId, request.getPlayerName());
        GameView gameView = GameView.from(game);
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/state", gameView);
        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/{gameId}/round/finish")
    @Operation(summary = "Finalize current round when timer is over")
    public ResponseEntity<GameView> finishRound(@PathVariable String gameId, @RequestBody CreateGameRequest request) {
        log.info("finish round: gameId={}, playerName={}", gameId, request.getPlayerName());
        Game game = gameService.finishRoundIfExpired(gameId, request.getPlayerName());
        GameView gameView = GameView.from(game);
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/state", gameView);
        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/{gameId}/leave")
    @Operation(summary = "Player 2 leaves lobby")
    public ResponseEntity<GameView> leaveLobby(@PathVariable String gameId, @RequestBody CreateGameRequest request) {
        log.info("leave lobby request: gameId={}, playerName={}", gameId, request.getPlayerName());
        Game game = gameService.leaveLobby(gameId, request.getPlayerName());
        GameView gameView = GameView.from(game);

        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/state", gameView);
        GameEvent leaveEvent = GameEvent.player2Left(gameId, request.getPlayerName(), game.getPlayer1Name());
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/event", leaveEvent);

        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/{gameId}/delete")
    @Operation(summary = "Delete lobby (host only)")
    public ResponseEntity<Void> deleteLobby(@PathVariable String gameId, @RequestBody CreateGameRequest request) {
        log.info("delete lobby request: gameId={}, playerName={}", gameId, request.getPlayerName());
        Game deletedGame = gameService.deleteLobby(gameId, request.getPlayerName());
        GameEvent deleteEvent = GameEvent.gameDeleted(gameId, deletedGame.getPlayer1Name());
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/event", deleteEvent);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{gameId}/restart")
    @Operation(summary = "Restart match from current lobby players")
    public ResponseEntity<GameView> restartMatch(@PathVariable String gameId, @RequestBody CreateGameRequest request) {
        log.info("restart match request: gameId={}, playerName={}", gameId, request.getPlayerName());
        Game game = gameService.restartMatch(gameId, request.getPlayerName());
        GameView gameView = GameView.from(game);
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/state", gameView);
        return ResponseEntity.ok(gameView);
    }

    private void publishStateAndReadyEvent(Game game, GameView gameView) {
        simpMessagingTemplate.convertAndSend("/topic/game/" + game.getId() + "/state", gameView);

        if (GameStatus.IN_PROGRESS.equals(game.getStatus()) && game.getPlayer2Name() != null) {
            GameEvent event = GameEvent.player2Joined(
                    game.getId(),
                    game.getPlayer2Name(),
                    game.getPlayer1Name(),
                    game.getStatus().name()
            );
            simpMessagingTemplate.convertAndSend("/topic/game/" + game.getId() + "/event", event);
        }
    }
}