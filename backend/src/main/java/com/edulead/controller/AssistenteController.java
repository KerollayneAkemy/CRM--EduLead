package com.edulead.controller;

import com.edulead.service.AssistenteService;
import com.edulead.security.AssistantRateLimiter;
import com.edulead.security.CurrentUser;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistente")
public class AssistenteController {
    private final AssistenteService assistente;
    private final AssistantRateLimiter rateLimiter;

    public AssistenteController(AssistenteService assistente, AssistantRateLimiter rateLimiter) {
        this.assistente = assistente;
        this.rateLimiter = rateLimiter;
    }

    @GetMapping("/status")
    public Map<String, Boolean> status() {
        return Map.of("disponivel", assistente.available());
    }

    @PostMapping
    public Map<String, String> ask(@RequestBody(required = false) Map<String, String> body) {
        if (assistente.available()) {
            rateLimiter.acquire(CurrentUser.get().id());
        }
        return Map.of("resposta", assistente.ask(body == null ? null : body.get("pergunta")));
    }
}
