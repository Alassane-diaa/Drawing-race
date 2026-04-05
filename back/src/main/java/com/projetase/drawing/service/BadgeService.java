package com.projetase.drawing.service;

import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.model.Badge;
import com.projetase.drawing.model.BadgeDTO;
import com.projetase.drawing.model.UserBadge;
import com.projetase.drawing.repository.BadgeRepo;
import com.projetase.drawing.repository.UserBadgeRepo;
import com.projetase.drawing.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepo     badgeRepo;
    private final UserBadgeRepo userBadgeRepo;
    private final UserRepo      userRepo;

    // ── Tous les badges existants ─────────────────────────────────────────────
    public List<BadgeDTO> getAllBadges() {
        return badgeRepo.findAll().stream()
                .map(b -> new BadgeDTO(b.getId(), b.getName(), b.getDescription(), null))
                .toList();
    }

    // ── Badges débloqués par le joueur connecté ───────────────────────────────
    public List<BadgeDTO> getMyBadges(String username) {
        AppUser user = findUser(username);

        return userBadgeRepo.findByUser(user).stream()
                .map(ub -> new BadgeDTO(
                        ub.getBadge().getId(),
                        ub.getBadge().getName(),
                        ub.getBadge().getDescription(),
                        ub.getUnlockedAt()
                ))
                .toList();
    }

    // ── Débloquer un badge ────────────────────────────────────────────────────
    public BadgeDTO unlockBadge(String username, Long badgeId) {
        AppUser user  = findUser(username);
        Badge   badge = badgeRepo.findById(badgeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Badge introuvable : " + badgeId));

        // Idempotent : on ne débloque pas deux fois le même badge
        if (userBadgeRepo.findByUserAndBadge(user, badge).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Badge déjà débloqué.");
        }

        UserBadge ub = userBadgeRepo.save(new UserBadge(user, badge));

        return new BadgeDTO(
                badge.getId(),
                badge.getName(),
                badge.getDescription(),
                ub.getUnlockedAt()
        );
    }

    // ── Utilitaire ────────────────────────────────────────────────────────────
    private AppUser findUser(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Utilisateur introuvable : " + username));
    }
}