package com.edulead.controller;

import com.edulead.model.Tarefa;
import com.edulead.service.TarefaService;
import com.edulead.security.RequiresRole;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tarefas")
@CrossOrigin(origins = "${edulead.cors.allowed-origin}")
public class TarefaController {
    private final TarefaService tarefas;

    public TarefaController(TarefaService tarefas) {
        this.tarefas = tarefas;
    }

    @GetMapping
    public List<Tarefa> all() {
        return tarefas.all();
    }

    @PostMapping
    public Tarefa create(@RequestBody Tarefa tarefa) {
        return tarefas.create(tarefa);
    }

    @PutMapping("/{id}")
    public Tarefa update(@PathVariable Long id, @RequestBody Tarefa tarefa) {
        return tarefas.update(id, tarefa);
    }

    @PatchMapping("/{id}/concluir")
    public Tarefa done(@PathVariable Long id) {
        return tarefas.done(id);
    }

    @DeleteMapping("/{id}")
    @RequiresRole("GESTOR")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        tarefas.delete(id);
    }
}
