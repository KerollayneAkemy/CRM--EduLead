package com.edulead.security;

import com.edulead.exception.ApiException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Limite local de tentativas inválidas de login. A chave combina origem e e-mail,
 * evitando bloqueio global de uma conta por solicitações vindas de outra origem.
 */
@Component
public class LoginAttemptLimiter {
    static final int MAX_FAILURES = 5;
    static final Duration BLOCK_DURATION = Duration.ofMinutes(15);
    private static final int MAX_TRACKED_KEYS = 10_000;

    private final Clock clock;
    private final ConcurrentHashMap<String, AttemptWindow> failures = new ConcurrentHashMap<>();

    public LoginAttemptLimiter() {
        this(Clock.systemUTC());
    }

    LoginAttemptLimiter(Clock clock) {
        this.clock = clock;
    }

    public void checkAllowed(String key) {
        AttemptWindow state = failures.get(key);
        if (state == null) {
            return;
        }

        Instant now = clock.instant();
        if (!state.expiresAt().isAfter(now)) {
            failures.remove(key, state);
            return;
        }

        if (state.count() >= MAX_FAILURES) {
            throw ApiException.tooManyRequests("Muitas tentativas de acesso. Aguarde 15 minutos antes de tentar novamente");
        }
    }

    public void recordFailure(String key) {
        Instant now = clock.instant();
        failures.compute(key, (ignored, state) -> {
            if (state == null || !state.expiresAt().isAfter(now)) {
                return new AttemptWindow(1, now.plus(BLOCK_DURATION));
            }
            return new AttemptWindow(Math.min(MAX_FAILURES, state.count() + 1), state.expiresAt());
        });
        removeExpiredEntries(now);
    }

    public void clear(String key) {
        failures.remove(key);
    }

    private void removeExpiredEntries(Instant now) {
        if (failures.size() <= MAX_TRACKED_KEYS) {
            return;
        }
        failures.entrySet().removeIf(entry -> !entry.getValue().expiresAt().isAfter(now));
        if (failures.size() > MAX_TRACKED_KEYS) {
            failures.entrySet().stream().findFirst()
                    .ifPresent(entry -> failures.remove(entry.getKey(), entry.getValue()));
        }
    }

    private record AttemptWindow(int count, Instant expiresAt) {
    }
}
