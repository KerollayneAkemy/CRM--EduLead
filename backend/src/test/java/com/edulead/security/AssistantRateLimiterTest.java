package com.edulead.security;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AssistantRateLimiterTest {
    @Test
    void blocksCallsAboveTheShortWindowLimit() {
        AssistantRateLimiter limiter = new AssistantRateLimiter(
                Clock.fixed(Instant.parse("2026-11-23T00:00:00Z"), ZoneOffset.UTC));

        for (int request = 0; request < AssistantRateLimiter.MAX_REQUESTS; request++) {
            limiter.acquire(5L);
        }

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> limiter.acquire(5L));
        assertEquals(429, exception.getStatusCode().value());
    }
}
