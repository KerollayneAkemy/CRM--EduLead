package com.edulead.controller;

import com.edulead.model.Usuario;
import com.edulead.repository.UsuarioRepository;
import com.edulead.security.LoginAttemptLimiter;
import com.edulead.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthControllerTest {
    @Test
    void loginKeepsResponseContractAndNormalizesLegacyGestoraRoleInToken() {
        UsuarioRepository usuarios = mock(UsuarioRepository.class);
        JwtService jwt = mock(JwtService.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        Usuario user = new Usuario();
        user.id = 4L;
        user.nome = "Gestora";
        user.email = "gestora@edulead.com";
        user.senha = "$2a$10$hash";
        user.cargo = "GESTORA";
        user.ativo = true;
        when(usuarios.findByEmail(user.email)).thenReturn(java.util.Optional.of(user));
        when(encoder.matches("senha-segura", user.senha)).thenReturn(true);
        when(jwt.generateToken(4L, "GESTOR")).thenReturn("jwt-de-teste");

        Map<String, Object> response = new AuthController(usuarios, jwt, encoder, new LoginAttemptLimiter())
                .login(Map.of("email", user.email, "senha", "senha-segura"), mock(HttpServletRequest.class));

        assertEquals("jwt-de-teste", response.get("token"));
        assertEquals(user.email, ((Map<?, ?>) response.get("usuario")).get("email"));
    }

    @Test
    void invalidCredentialsReturnUnauthorized() {
        UsuarioRepository usuarios = mock(UsuarioRepository.class);
        when(usuarios.findByEmail("inexistente@edulead.com")).thenReturn(java.util.Optional.empty());

        org.springframework.web.server.ResponseStatusException exception = assertThrows(
                org.springframework.web.server.ResponseStatusException.class,
                () -> new AuthController(usuarios, mock(JwtService.class), mock(PasswordEncoder.class),
                        new LoginAttemptLimiter())
                        .login(Map.of("email", "inexistente@edulead.com", "senha", "qualquer"),
                                mock(HttpServletRequest.class)));

        assertEquals(401, exception.getStatusCode().value());
    }
}
