package com.projetase.drawing.controller;

import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    @Value("${avatar.upload.dir:uploads/avatars}")
    private String avatarUploadDir;

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
    public ResponseEntity<org.springframework.core.io.Resource> getAvatar(
            @PathVariable String filename
    ) throws IOException {
        Path path = Paths.get(avatarUploadDir).resolve(filename).normalize();
        UrlResource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "image/png";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (lower.endsWith(".gif"))  contentType = "image/gif";
        else if (lower.endsWith(".webp")) contentType = "image/webp";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<?> deleteAvatar(Principal principal) throws IOException {
        userService.deleteAvatar(extractUsername(principal));
        return ResponseEntity.ok(Map.of("message", "Avatar supprimé"));
    }
}