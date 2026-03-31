package com.projetase.drawing.controller;

import com.projetase.drawing.model.BadgeDTO;
import com.projetase.drawing.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/badge")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    // GET /badge
    // Liste complète de tous les badges (utile pour afficher les badges verrouillés)
    @GetMapping
    public ResponseEntity<List<BadgeDTO>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    // GET /badge/mine
    // Badges débloqués par le joueur connecté
    @GetMapping("/mine")
    public ResponseEntity<List<BadgeDTO>> getMyBadges(Principal principal) {
        return ResponseEntity.ok(badgeService.getMyBadges(principal.getName()));
    }

    // POST /badge/{badgeId}/unlock
    // Débloque un badge pour le joueur connecté
    // Retourne 409 CONFLICT si déjà débloqué, 404 si le badge n'existe pas
    @PostMapping("/{badgeId}/unlock")
    public ResponseEntity<BadgeDTO> unlockBadge(
            @PathVariable Long badgeId,
            Principal principal
    ) {
        return ResponseEntity.ok(badgeService.unlockBadge(principal.getName(), badgeId));
    }
}