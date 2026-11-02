package com.edulead.controller;

import com.edulead.model.Interacao;
import com.edulead.service.InteracaoService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interacoes")
public class InteracaoController {
    private final InteracaoService interacoes;

    public InteracaoController(InteracaoService interacoes) {
        this.interacoes = interacoes;
    }

    @PostMapping
    public Interacao create(@RequestBody Interacao interacao) {
        return interacoes.create(interacao);
    }
}

