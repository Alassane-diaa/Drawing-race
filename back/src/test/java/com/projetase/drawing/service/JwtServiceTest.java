package com.projetase.drawing.service;

import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.model.LoginRequest;
import com.projetase.drawing.repository.UserRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepo userRepo;

    @Mock
    private JwtEncoder jwtEncoder;

    @InjectMocks
    private JwtService jwtService;

    @Test
    void generateToken_shouldReturnEncodedTokenValue() {
        Jwt jwt = new Jwt(
                "generated.jwt.token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", "alice", "role", "USER")
        );

        when(jwtEncoder.encode(any())).thenReturn(jwt);

        String token = jwtService.generateToken("alice", "USER");

        assertThat(token).isEqualTo("generated.jwt.token");
        verify(jwtEncoder).encode(any());
    }

    @Test
    void register_shouldSaveEncodedUserAndReturnToken() {
        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("secret");

        Jwt jwt = new Jwt(
                "token.from.register",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", "alice", "role", "USER")
        );

        when(passwordEncoder.encode("secret")).thenReturn("hashed-secret");
        when(jwtEncoder.encode(any())).thenReturn(jwt);

        Map<String, String> result = jwtService.register(request);

        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepo).save(userCaptor.capture());
        AppUser savedUser = userCaptor.getValue();

        assertThat(savedUser.getUsername()).isEqualTo("alice");
        assertThat(savedUser.getPassword()).isEqualTo("hashed-secret");
        assertThat(savedUser.getRole()).isEqualTo("USER");
        assertThat(result).containsEntry("token", "token.from.register");
    }
}