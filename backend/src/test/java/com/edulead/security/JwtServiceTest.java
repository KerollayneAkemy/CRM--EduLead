package com.edulead.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;

class JwtServiceTest {
    private final JwtService jwtService = new JwtService("segredo-de-teste-com-pelo-menos-trinta-e-dois-caracteres");

    @Test
    void generatesAndValidatesToken() {
        String token = jwtService.generateToken(12L, "GESTOR");

        assertEquals("12", jwtService.validateToken(token).getSubject());
        assertEquals("GESTOR", jwtService.validateToken(token).get("role", String.class));
    }

    @Test
    void rejectsShortSecret() {
        assertThrows(IllegalStateException.class, () -> new JwtService("curto"));
    }
}
