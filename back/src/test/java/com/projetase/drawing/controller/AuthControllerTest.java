package com.projetase.drawing.controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.model.LoginRequest;
import com.projetase.drawing.repository.UserRepo;
import com.projetase.drawing.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.Map;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserRepo userRepo;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void login_shouldReturnTokenWhenCredentialsAreValid() throws Exception {
        AppUser user = new AppUser();
        user.setUsername("alice");
        user.setPassword("stored-hash");
        user.setRole("USER");

        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(user)); // fix
        when(passwordEncoder.matches("secret", "stored-hash")).thenReturn(true);
        when(jwtService.generateToken("alice", "USER")).thenReturn("jwt-token");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "alice",
                                "password", "secret"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    void login_shouldReturnUnauthorizedWhenCredentialsAreInvalid() throws Exception {
        AppUser user = new AppUser();
        user.setUsername("alice");
        user.setPassword("stored-hash");
        user.setRole("USER");

        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(user)); // fix
        when(passwordEncoder.matches("wrong", "stored-hash")).thenReturn(false);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "alice",
                                "password", "wrong"
                        ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Identifiants invalides"));
    }

    @Test
    void register_shouldReturnTokenFromJwtService() throws Exception {
        when(jwtService.register(any(LoginRequest.class))).thenReturn(Map.of("token", "register-token"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "new-user",
                                "password", "new-password"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("register-token"));
    }
}
