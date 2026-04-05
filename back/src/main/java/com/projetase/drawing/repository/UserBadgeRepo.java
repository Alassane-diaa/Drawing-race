package com.projetase.drawing.repository;

import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.model.Badge;
import com.projetase.drawing.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBadgeRepo extends JpaRepository<UserBadge, Long> {

    // Tous les badges débloqués par un joueur
    List<UserBadge> findByUser(AppUser user);

    // Vérifie si un joueur possède déjà un badge (pour éviter les doublons)
    Optional<UserBadge> findByUserAndBadge(AppUser user, Badge badge);
}
