package com.projetase.drawing.controller;

import com.projetase.drawing.dto.StrokeEvent;
import com.projetase.drawing.service.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
@RequiredArgsConstructor
public class GameSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/game/{gameId}/stroke")
    public void receiveStroke(@DestinationVariable String gameId, StrokeEvent strokeEvent) {
        gameService.validateStrokeSender(gameId, strokeEvent.getPlayerName());

        StrokeEvent outbound = StrokeEvent.builder()
                .gameId(gameId)
                .playerName(strokeEvent.getPlayerName())
                .stroke(strokeEvent.getStroke())
                .timestamp(System.currentTimeMillis())
                .build();

        log.debug("stroke event gameId={} player={}", gameId, strokeEvent.getPlayerName());
        simpMessagingTemplate.convertAndSend("/topic/game/" + gameId + "/stroke", outbound);
    }
}

