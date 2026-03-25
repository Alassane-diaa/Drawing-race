# Multiplayer API (MVP)

## Objectif
- REST: creer/rejoindre une partie
- WebSocket STOMP: diffuser les traits en temps reel
- REST `/process`: reste dedie a la prediction

## Endpoints REST

### 1) Creer une partie
`POST /game/create`

Body:
```json
{
  "playerName": "alice"
}
```

Reponse:
```json
{
  "gameId": "...",
  "player1Name": "alice",
  "player2Name": null,
  "status": "WAITING"
}
```

### 2) Rejoindre une partie
`POST /game/connect`

Body:
```json
{
  "gameId": "...",
  "playerName": "bob"
}
```

### 3) Rejoindre aleatoirement
`POST /game/connect/random`

Body:
```json
{
  "playerName": "bob"
}
```

## WebSocket STOMP

### Connexion
- SockJS endpoint: `/ws`
- Prefix client->serveur: `/app`
- Prefix serveur->clients: `/topic`

### Envoyer un trait
- Destination: `/app/game/{gameId}/stroke`
- Payload:
```json
{
  "playerName": "alice",
  "stroke": {
    "points": [
      { "x": 10.0, "y": 15.0 },
      { "x": 12.0, "y": 18.0 }
    ]
  }
}
```

### S'abonner
- Etat de partie: `/topic/game/{gameId}/state`
- Flux des traits: `/topic/game/{gameId}/stroke`

## Erreurs
Les erreurs metier renvoient HTTP 400:
```json
{
  "code": "GAME_NOT_FOUND",
  "message": "Partie introuvable: ..."
}
```

