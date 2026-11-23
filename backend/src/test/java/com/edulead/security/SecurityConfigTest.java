package com.edulead.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {
    @Test
    void rejectsWildcardCorsOrigins() {
        assertThrows(IllegalStateException.class,
                () -> new SecurityConfig(mock(JwtAuthenticationFilter.class), "*"));
    }
}
