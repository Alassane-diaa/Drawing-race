package com.projetase.drawing.service;

import com.projetase.drawing.exception.GameException;
import com.projetase.drawing.model.Game;
import com.projetase.drawing.model.GameStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

class GameServiceTest {

    private GameService gameService;

    @BeforeEach
    void setUp() {
        gameService = new GameService(mock(UserService.class));
    }

    @Test
    void createGame_shouldInitializeLobbyWithHostReady() {
        Game game = gameService.createGame("  alice  ");

        assertThat(game.getId()).isNotBlank();
        assertThat(game.getPlayer1Name()).isEqualTo("alice");
        assertThat(game.isPlayer1Ready()).isTrue();
        assertThat(game.isPlayer2Ready()).isFalse();
        assertThat(game.getStatus()).isEqualTo(GameStatus.WAITING);
    }

    @Test
    void createGame_shouldRejectBlankPlayer() {
        assertThatThrownBy(() -> gameService.createGame("   "))
                .isInstanceOf(GameException.class)
                .extracting(ex -> ((GameException) ex).getCode())
                .isEqualTo("INVALID_PLAYER");
    }

    @Test
    void connectToGame_shouldAttachSecondPlayerAndSwitchToInProgress() {
        Game created = gameService.createGame("alice");

        Game connected = gameService.connectToGame("bob", created.getId());

        assertThat(connected.getPlayer2Name()).isEqualTo("bob");
        assertThat(connected.getStatus()).isEqualTo(GameStatus.IN_PROGRESS);
    }

    @Test
    void connectToGame_shouldRejectUnknownGame() {
        assertThatThrownBy(() -> gameService.connectToGame("bob", "404"))
                .isInstanceOf(GameException.class)
                .extracting(ex -> ((GameException) ex).getCode())
                .isEqualTo("GAME_NOT_FOUND");
    }

    @Test
    void connectToGame_shouldRejectHostAsSecondPlayer() {
        Game created = gameService.createGame("alice");

        assertThatThrownBy(() -> gameService.connectToGame("alice", created.getId()))
                .isInstanceOf(GameException.class)
                .extracting(ex -> ((GameException) ex).getCode())
                .isEqualTo("PLAYER_ALREADY_IN_GAME");
    }

    @Test
    void connectToRandomGame_shouldJoinExistingWaitingGameWhenAvailable() {
        Game created = gameService.createGame("alice");

        Game result = gameService.connectToRandomGame("bob");

        assertThat(result.getId()).isEqualTo(created.getId());
        assertThat(result.getPlayer2Name()).isEqualTo("bob");
        assertThat(result.getStatus()).isEqualTo(GameStatus.IN_PROGRESS);
    }

    @Test
    void markPlayerReady_shouldSetPlayer2ReadyFlag() {
        Game created = gameService.createGame("alice");
        gameService.connectToGame("bob", created.getId());

        Game updated = gameService.markPlayerReady(created.getId(), "bob");

        assertThat(updated.isPlayer2Ready()).isTrue();
    }

    @Test
    void startGame_shouldRequireBothPlayersReady() {
        Game created = gameService.createGame("alice");
        gameService.connectToGame("bob", created.getId());

        assertThatThrownBy(() -> gameService.startGame(created.getId(), "alice"))
                .isInstanceOf(GameException.class)
                .extracting(ex -> ((GameException) ex).getCode())
                .isEqualTo("PLAYERS_NOT_READY");
    }

    @Test
    void startGame_shouldStartWhenHostLaunchesAndEveryoneReady() {
        Game created = gameService.createGame("alice");
        gameService.connectToGame("bob", created.getId());
        gameService.markPlayerReady(created.getId(), "bob");

        Game started = gameService.startGame(created.getId(), "alice");

        assertThat(started.getStatus()).isEqualTo(GameStatus.STARTED);
    }

    @Test
    void leaveLobby_shouldResetToWaitingAndRemovePlayer2() {
        Game created = gameService.createGame("alice");
        gameService.connectToGame("bob", created.getId());
        gameService.markPlayerReady(created.getId(), "bob");

        Game updated = gameService.leaveLobby(created.getId(), "bob");

        assertThat(updated.getPlayer2Name()).isNull();
        assertThat(updated.isPlayer2Ready()).isFalse();
        assertThat(updated.getStatus()).isEqualTo(GameStatus.WAITING);
    }

    @Test
    void deleteLobby_shouldRemoveGameAndFailFurtherLookup() {
        Game created = gameService.createGame("alice");

        gameService.deleteLobby(created.getId(), "alice");

        assertThatThrownBy(() -> gameService.getGameById(created.getId()))
                .isInstanceOf(GameException.class)
                .extracting(ex -> ((GameException) ex).getCode())
                .isEqualTo("GAME_NOT_FOUND");
    }
}
