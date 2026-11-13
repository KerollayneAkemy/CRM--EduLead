package com.edulead.controller;

import com.edulead.service.AssistenteService;
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

    public AssistenteController(AssistenteService assistente) {
        this.assistente = assistente;
    }

    @GetMapping("/status")
    public Map<String, Boolean> status() {
        return Map.of("disponivel", assistente.available());
    }

    @PostMapping
    public Map<String, String> ask(@RequestBody Map<String, String> body) {
        return Map.of("resposta", assistente.ask(body.get("pergunta")));
    }
}
