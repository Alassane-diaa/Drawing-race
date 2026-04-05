package com.projetase.drawing.service;

import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;

    /**
     * Dossier de stockage des avatars.
     * Valeur par défaut : "uploads/avatars" (développement local).
     * En Docker, surchargée par la variable d'environnement AVATAR_UPLOAD_DIR
     * qui pointe vers le volume persistant monté dans le conteneur.
     */
    @Value("${avatar.upload.dir:uploads/avatars}")
    private String avatarUploadDir;

    // ── Stats du joueur connecté ──────────────────────────────────────────────
    public AppUser getMyStats(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    // ── Profil public ─────────────────────────────────────────────────────────
    public AppUser getUserByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    // ── Classement ────────────────────────────────────────────────────────────
    public List<AppUser> getLeaderboard() {
        return userRepo.findAllByOrderByWinsDesc();
    }

    // ── Mise à jour des stats après une partie ────────────────────────────────
    // Appelé par GameService.persistMatchStats() à la fin de chaque match.
    public AppUser updateStats(String username, int newGamesPlayed, int newWins, float newAccuracy) {
        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setGamesPlayed(newGamesPlayed);
        user.setWins(newWins);
        user.setAccuracy(newAccuracy);
        return userRepo.save(user);
    }

    // ── Upload avatar ─────────────────────────────────────────────────────────
    // Le fichier est écrit dans avatarUploadDir (variable d'env en Docker,
    // dossier local en dev). Seul le nom du fichier est stocké en BDD.
    //___________________________________________________________________________
    public String uploadAvatar(String username, MultipartFile file) throws IOException {
        String filename = username + "_" + file.getOriginalFilename();
        Path path = Paths.get(avatarUploadDir).resolve(filename);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setAvatarFilename(filename);
        userRepo.save(user);

        return filename;
    }

    // ── Suppression avatar ────────────────────────────────────────────────────
    public void deleteAvatar(String username) throws IOException {
        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (user.getAvatarFilename() != null) {
            Files.deleteIfExists(Paths.get(avatarUploadDir).resolve(user.getAvatarFilename()));
            user.setAvatarFilename(null);
            userRepo.save(user);
        }
    }
}