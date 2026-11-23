package com.edulead.security;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LoginAttemptLimiterTest {
    @Test
    void blocksTheSameOriginAndEmailAfterFiveInvalidAttempts() {
        LoginAttemptLimiter limiter = new LoginAttemptLimiter(
                Clock.fixed(Instant.parse("2026-11-23T00:00:00Z"), ZoneOffset.UTC));
        String key = "203.0.113.1|ana@edulead.com";

        for (int attempt = 0; attempt < LoginAttemptLimiter.MAX_FAILURES; attempt++) {
            limiter.recordFailure(key);
        }

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> limiter.checkAllowed(key));
        assertEquals(429, exception.getStatusCode().value());
    }

    @Test
    void successfulLoginClearsPreviousFailures() {
        LoginAttemptLimiter limiter = new LoginAttemptLimiter(
                Clock.fixed(Instant.parse("2026-11-23T00:00:00Z"), ZoneOffset.UTC));
        String key = "203.0.113.2|emily@edulead.com";

        limiter.recordFailure(key);
        limiter.clear(key);

        assertDoesNotThrow(() -> limiter.checkAllowed(key));
    }
}
