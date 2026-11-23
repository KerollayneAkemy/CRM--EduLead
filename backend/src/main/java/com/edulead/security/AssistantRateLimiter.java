package com.edulead.security;

import com.edulead.exception.ApiException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/** Limita chamadas ao provedor de IA por usuário autenticado para conter abuso e custo. */
@Component
public class AssistantRateLimiter {
    static final int MAX_REQUESTS = 20;
    static final Duration WINDOW_DURATION = Duration.ofMinutes(5);

    private final Clock clock;
    private final ConcurrentHashMap<Long, RequestWindow> requests = new ConcurrentHashMap<>();

    public AssistantRateLimiter() {
        this(Clock.systemUTC());
    }

    AssistantRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public void acquire(Long userId) {
        Instant now = clock.instant();
        RequestWindow window = requests.compute(userId, (ignored, current) -> {
            if (current == null || !current.expiresAt().isAfter(now)) {
                return new RequestWindow(1, now.plus(WINDOW_DURATION));
            }
            return new RequestWindow(current.count() + 1, current.expiresAt());
        });
        if (window.count() > MAX_REQUESTS) {
            throw ApiException.tooManyRequests("Limite temporário do assistente atingido. Aguarde alguns minutos");
        }
    }

    private record RequestWindow(int count, Instant expiresAt) {
    }
}
