package com.projetase.drawing.controller;

import com.nimbusds.jose.util.Resource;
import com.projetase.drawing.model.LoginRequest;
import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.repository.UserRepo;
import com.projetase.drawing.service.JwtService;
import com.projetase.drawing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Récupère le username depuis le token JWT automatiquement
    private String extractUsername(Principal principal) {
        return principal.getName();
    }

    @GetMapping("/me")
    public ResponseEntity<AppUser> getMyStats(Principal principal) {
        return ResponseEntity.ok(userService.getMyStats(extractUsername(principal)));
    }

    @GetMapping("/{username}")
    public ResponseEntity<AppUser> getPublicProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<AppUser>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }


    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestPart("avatar") MultipartFile file,
            Principal principal
    ) throws IOException {
        String filename = userService.uploadAvatar(extractUsername(principal), file);
        return ResponseEntity.ok(Map.of("filename", filename));
    }

    @GetMapping("/avatar/{filename}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) throws IOException {
        Path path = Paths.get("uploads/avatars/" + filename);
        org.springframework.core.io.Resource resource = new UrlResource(path.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body((Resource) resource);
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<?> deleteAvatar(Principal principal) throws IOException {
        userService.deleteAvatar(extractUsername(principal));
        return ResponseEntity.ok(Map.of("message", "Avatar supprimé"));
    }
}
