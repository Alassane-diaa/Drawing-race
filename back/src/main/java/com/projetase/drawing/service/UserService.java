package com.projetase.drawing.service;

import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.model.LoginRequest;
import com.projetase.drawing.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;

    // Stats du joueur connecté — on reçoit le username extrait du token JWT
    public AppUser getMyStats(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    // Profil public
    public AppUser getUserByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    // Classement
    public List<AppUser> getLeaderboard() {
        return userRepo.findAllByOrderByWinsDesc();
    }

    // Mise à jour des stats après une partie
    public AppUser updateStats(String username, int newGamesPlayed, int newWins, float newAccuracy) {
        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setGamesPlayed(newGamesPlayed);
        user.setWins(newWins);
        user.setAccuracy(newAccuracy);

        return userRepo.save(user); // UPDATE en BDD
    }

    // Upload avatar
    public String uploadAvatar(String username, MultipartFile file) throws IOException {
        String filename = username + "_" + file.getOriginalFilename();
        Path path = Paths.get("uploads/avatars/" + filename);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        // on sauvegarde le nom du fichier dans la BDD
        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setAvatarFilename(filename);
        userRepo.save(user);

        return filename;
    }

    // Supprimer avatar
    public void deleteAvatar(String username) throws IOException {
        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (user.getAvatarFilename() != null) {
            Files.deleteIfExists(Paths.get("uploads/avatars/" + user.getAvatarFilename()));
            user.setAvatarFilename(null);
            userRepo.save(user);
        }
    }
}
