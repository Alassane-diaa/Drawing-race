package com.projetase.drawing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projetase.drawing.model.AppUser;
import com.projetase.drawing.repository.UserRepo;
import com.projetase.drawing.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepo userRepo;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtService jwtService;

    @Test
    void login_shouldReturnTokenWhenCredentialsAreValid() throws Exception {
        AppUser user = new AppUser();
        user.setUsername("alice");
        user.setPassword("stored-hash");
        user.setRole("USER");

        when(userRepo.findByUsername("alice")).thenReturn(user);
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

        when(userRepo.findByUsername("alice")).thenReturn(user);
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
        when(jwtService.register(any())).thenReturn(Map.of("token", "register-token"));

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