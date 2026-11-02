package com.edulead.controller;

import com.edulead.model.Tarefa;
import com.edulead.service.TarefaService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tarefas")
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
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        tarefas.delete(id);
    }
}
