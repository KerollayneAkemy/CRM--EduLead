package com.edulead.controller;

import com.edulead.model.Interacao;
import com.edulead.model.Interessado;
import com.edulead.model.Tarefa;
import com.edulead.service.InteressadoService;
import com.edulead.service.InteracaoService;
import com.edulead.service.HistoricoEtapaService;
import com.edulead.service.TarefaService;
import java.util.List;
import java.util.Map;
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
@RequestMapping("/api/interessados")
public class InteressadoController {
    private final InteressadoService interessados;
    private final InteracaoService interacoes;
    private final TarefaService tarefas;
    private final HistoricoEtapaService historicos;

    public InteressadoController(InteressadoService interessados, InteracaoService interacoes, TarefaService tarefas,
            HistoricoEtapaService historicos) {
        this.interessados = interessados;
        this.interacoes = interacoes;
        this.tarefas = tarefas;
        this.historicos = historicos;
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
        Interessado atual = interessados.find(id);
        String etapaAnterior = atual.etapa;
        Interessado atualizado = interessados.changeStage(id, body.get("etapa"));
        if (!etapaAnterior.equals(atualizado.etapa)) {
            historicos.register(atualizado, etapaAnterior);
        }
        return atualizado;
    }

    @GetMapping("/{id}/interacoes")
    public List<Interacao> history(@PathVariable Long id) {
        return interacoes.history(id);
    }

    @GetMapping("/{id}/tarefas")
    public List<Tarefa> tasks(@PathVariable Long id) {
        return tarefas.forInteressado(id);
    }

    @GetMapping("/{id}/historico-etapas")
    public List<com.edulead.model.HistoricoEtapa> stageHistory(@PathVariable Long id) {
        return historicos.allForInteressado(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        interessados.delete(id);
    }
}
