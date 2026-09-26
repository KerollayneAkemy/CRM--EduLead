package com.edulead.controller;

import com.edulead.model.Interacao;
import com.edulead.model.Interessado;
import com.edulead.model.Tarefa;
import com.edulead.service.InteressadoService;
import com.edulead.service.InteracaoService;
import com.edulead.service.TarefaService;
import com.edulead.security.RequiresRole;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interessados")
@CrossOrigin(origins = "${edulead.cors.allowed-origin}")
public class InteressadoController {
    private final InteressadoService interessados;
    private final InteracaoService interacoes;
    private final TarefaService tarefas;

    public InteressadoController(InteressadoService interessados, InteracaoService interacoes, TarefaService tarefas) {
        this.interessados = interessados;
        this.interacoes = interacoes;
        this.tarefas = tarefas;
    }

    @GetMapping
    public List<Interessado> all() {
        return interessados.all();
    }

    @GetMapping("/proximos-contatos") 
    public List<Interessado> followUps() {
        return interessados.followUps();
    }

    @GetMapping("/{id}")
    public Interessado one(@PathVariable Long id) {
        return interessados.find(id);
    }

    @PostMapping
    public Interessado create(@RequestBody Interessado interessado) {
        return interessados.create(interessado);
    }

    @PutMapping("/{id}")
    public Interessado update(@PathVariable Long id, @RequestBody Interessado interessado) {
        return interessados.update(id, interessado);
    }

    @PatchMapping("/{id}/etapa")
    public Interessado stage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String etapa = body.get("etapa");
        return interessados.changeStage(id, etapa);
    }

    @GetMapping("/{id}/interacoes")
    public List<Interacao> history(@PathVariable Long id) {
        return interacoes.history(id);
    }

    @GetMapping("/{id}/tarefas")
    public List<Tarefa> tasks(@PathVariable Long id) {
        return tarefas.forInteressado(id);
    }

    @DeleteMapping("/{id}")
    @RequiresRole("GESTOR")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        interessados.delete(id);
    }
}
