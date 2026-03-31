package com.projetase.drawing.controller;

import com.projetase.drawing.model.LoginRequest;
import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.repository.UserRepo;
import com.projetase.drawing.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Endpoints for login and registration")
public class AuthController {

    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepo userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Returns a JWT token when username/password are valid")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        AppUser user = userRepository.findByUsername(request.getUsername());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Identifiants invalides"));
        }
        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        Map<String, String> success = Map.of("token", token);
        return ResponseEntity.ok(success);
    }

    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Creates a user account and returns a JWT token")
    public ResponseEntity<Map<String, String>> register(@RequestBody LoginRequest request) {
        Map<String, String> success=jwtService.register(request);
        return ResponseEntity.ok(success);
    }
}

