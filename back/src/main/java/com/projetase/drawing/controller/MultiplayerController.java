package com.projetase.drawing.controller;

import com.projetase.drawing.dto.CreateGameRequest;
import com.projetase.drawing.dto.ConnectRequest;
import com.projetase.drawing.dto.GameEvent;
import com.projetase.drawing.dto.GameView;
import com.projetase.drawing.model.Game;
import com.projetase.drawing.model.GameStatus;
import com.projetase.drawing.service.GameService;
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
public class MultiplayerController {
    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/create")
    public ResponseEntity<GameView> create(@RequestBody CreateGameRequest request) {
        log.info("create game request: {}", request);
        Game game = gameService.createGame(request.getPlayerName());
        GameView gameView = GameView.from(game);
        simpMessagingTemplate.convertAndSend("/topic/game/" + game.getId() + "/state", gameView);
        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/connect")
    public ResponseEntity<GameView> connect(@RequestBody ConnectRequest request) {
        log.info("connect request: {}", request);
        Game game = gameService.connectToGame(request.getPlayerName(), request.getGameId());
        GameView gameView = GameView.from(game);
        publishStateAndReadyEvent(game, gameView);
        return ResponseEntity.ok(gameView);
    }

    @PostMapping("/connect/random")
    public ResponseEntity<GameView> connectRandom(@RequestBody CreateGameRequest request) {
        log.info("connect random {}", request);
        Game game = gameService.connectToRandomGame(request.getPlayerName());
        GameView gameView = GameView.from(game);
        publishStateAndReadyEvent(game, gameView);
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