package com.projetase.drawing.service;

import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.model.LoginRequest;
import com.projetase.drawing.repository.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Service
public class JwtService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepo userRepo;
    private final JwtEncoder jwtEncoder;

    public JwtService(PasswordEncoder passwordEncoder, UserRepo userRepo, JwtEncoder jwtEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.userRepo = userRepo;
        this.jwtEncoder = jwtEncoder;
    }

    public String generateToken(String username, String role) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("user-service")
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.HOURS))
                .subject(username)
                .claim("role", role)
                .build();
        return jwtEncoder.encode(JwtEncoderParameters.from(claims))
                .getTokenValue();
    }

    public Map<String, String> register(LoginRequest request) {

        // Créer le nouvel utilisateur
        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER"); // Rôle par défaut

        userRepo.save(user);

        // Générer le token JWT
        String token = generateToken(request.getUsername(),"USER");

        return Map.of("token", token);
    }
}
