package com.projetase.drawing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projetase.drawing.dto.GameEvent;
import com.projetase.drawing.dto.GameView;
import com.projetase.drawing.exception.GameException;
import com.projetase.drawing.model.Game;
import com.projetase.drawing.model.GameStatus;
import com.projetase.drawing.service.GameService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MultiplayerControllerTest {

    private MockMvc mockMvc;

        private final ObjectMapper objectMapper = new ObjectMapper();

        @Mock
    private GameService gameService;

        @Mock
    private SimpMessagingTemplate simpMessagingTemplate;

        @InjectMocks
        private MultiplayerController multiplayerController;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders
                                .standaloneSetup(multiplayerController)
                                .setControllerAdvice(new GameExceptionHandler())
                                .build();
        }

    @Test
    void create_shouldReturnGameViewAndPublishState() throws Exception {
        Game game = Game.builder()
                .id("12345")
                .player1Name("alice")
                .status(GameStatus.WAITING)
                .player1Ready(true)
                .player2Ready(false)
                .build();

        when(gameService.createGame("alice")).thenReturn(game);

        mockMvc.perform(post("/game/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("playerName", "alice"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value("12345"))
                .andExpect(jsonPath("$.player1Name").value("alice"))
                .andExpect(jsonPath("$.status").value("WAITING"));

        verify(simpMessagingTemplate, times(1))
                .convertAndSend(eq("/topic/game/12345/state"), isA(GameView.class));
    }

    @Test
    void connect_shouldReturnGameViewAndPublishStateAndJoinEvent() throws Exception {
        Game game = Game.builder()
                .id("12345")
                .player1Name("alice")
                .player2Name("bob")
                .status(GameStatus.IN_PROGRESS)
                .player1Ready(true)
                .player2Ready(false)
                .build();

        when(gameService.connectToGame("bob", "12345")).thenReturn(game);

        mockMvc.perform(post("/game/connect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "playerName", "bob",
                                "gameId", "12345"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value("12345"))
                .andExpect(jsonPath("$.player2Name").value("bob"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(simpMessagingTemplate, times(1))
                .convertAndSend(eq("/topic/game/12345/state"), isA(GameView.class));
        verify(simpMessagingTemplate, times(1))
                .convertAndSend(eq("/topic/game/12345/event"), isA(GameEvent.class));
    }

    @Test
    void getGame_shouldMapGameExceptionToBadRequest() throws Exception {
        when(gameService.getGameById("404"))
                .thenThrow(new GameException("GAME_NOT_FOUND", "Partie introuvable: 404"));

        mockMvc.perform(get("/game/404"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("GAME_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Partie introuvable: 404"));
    }
}