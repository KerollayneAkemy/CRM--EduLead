package com.edulead.service;

import com.edulead.exception.ApiException;
import com.edulead.model.Tarefa;
import com.edulead.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TarefaService {
    private final TarefaRepository tarefas;
    private final InteressadoService interessados;
    private final UsuarioService usuarios;

    public TarefaService(TarefaRepository tarefas, InteressadoService interessados, UsuarioService usuarios) {
        this.tarefas = tarefas;
        this.interessados = interessados;
        this.usuarios = usuarios;
    }

    public List<Tarefa> all() {
        return tarefas.findAll();
    }

    public List<Tarefa> forInteressado(Long id) {
        interessados.find(id);
        return tarefas.findByInteressadoIdOrderByPrazoAsc(id);
    }

    public Tarefa create(Tarefa item) {
        validateTitle(item);
        resolve(item);
        return tarefas.save(item);
    }
    public Tarefa update(Long id, Tarefa incoming) {
        Tarefa current = find(id);
        validateTitle(incoming);
        resolve(incoming);
        current.titulo = incoming.titulo.trim();
        current.descricao = incoming.descricao;
        current.prazo = incoming.prazo;
        current.prioridade = incoming.prioridade == null || incoming.prioridade.isBlank() ? "NORMAL" : incoming.prioridade;
        current.status = incoming.status == null || incoming.status.isBlank() ? current.status : incoming.status;
        current.interessado = incoming.interessado;
        current.responsavel = incoming.responsavel;
        return tarefas.save(current);
    }
    public Tarefa done(Long id) {
        Tarefa item = find(id);
        item.status = "CONCLUIDA";
        return tarefas.save(item);
    }

    public void delete(Long id) {
        tarefas.delete(find(id));
    }

    private Tarefa find(Long id) {
        return tarefas.findById(id).orElseThrow(() -> ApiException.notFound("Tarefa"));
    }

    private void validateTitle(Tarefa item) {
        if (item.titulo == null || item.titulo.isBlank()) {
            throw ApiException.badRequest("Informe o título da tarefa");
        }
    }

    private void resolve(Tarefa item) {
        if (item.interessado != null) {
            if (item.interessado.id == null) {
                throw ApiException.badRequest("Interessado inválido");
            }
            item.interessado = interessados.find(item.interessado.id);
        }
        if (item.responsavel != null) {
            if (item.responsavel.id == null) {
                throw ApiException.badRequest("Responsável inválido");
            }
            item.responsavel = usuarios.find(item.responsavel.id);
        }
    }
}
