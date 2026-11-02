package com.edulead.service;

import com.edulead.exception.ApiException;
import com.edulead.model.Tarefa;
import com.edulead.repository.TarefaRepository;
import com.edulead.security.AuthenticatedUser;
import com.edulead.security.CurrentUser;
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
        AuthenticatedUser current = CurrentUser.get();
        return current.isGestor() ? tarefas.findAll() : tarefas.findByResponsavelId(current.id());
    }

    public List<Tarefa> forInteressado(Long id) {
        interessados.find(id);
        AuthenticatedUser current = CurrentUser.get();
        return current.isGestor()
                ? tarefas.findByInteressadoIdOrderByPrazoAsc(id)
                : tarefas.findByInteressadoIdAndResponsavelIdOrderByPrazoAsc(id, current.id());
    }

    public Tarefa create(Tarefa item) {
        validateTitle(item);
        AuthenticatedUser current = CurrentUser.get();
        if (!current.isGestor()) {
            item.responsavel = usuarios.find(current.id());
        }
        resolve(item);
        return tarefas.save(item);
    }

    public Tarefa update(Long id, Tarefa incoming) {
        Tarefa current = find(id);
        validateTitle(incoming);
        if (!CurrentUser.get().isGestor()) {
            incoming.responsavel = current.responsavel;
        }
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
        requireGestor();
        tarefas.delete(find(id));
    }

    private Tarefa find(Long id) {
        Tarefa tarefa = tarefas.findById(id).orElseThrow(() -> ApiException.notFound("Tarefa"));
        AuthenticatedUser current = CurrentUser.get();
        if (!current.isGestor()
                && (tarefa.responsavel == null || !current.id().equals(tarefa.responsavel.id))) {
            throw ApiException.forbidden("Você não possui acesso a esta tarefa");
        }
        return tarefa;
    }

    private void validateTitle(Tarefa item) {
        if (item.titulo == null || item.titulo.isBlank()) {
            throw ApiException.badRequest("Informe o título da tarefa");
        }
        if (item.status != null && !item.status.isBlank()
                && !"PENDENTE".equals(item.status)
                && !"CONCLUIDA".equals(item.status)
                && !"CONCLUÍDA".equals(item.status)) {
            throw ApiException.badRequest("Status de tarefa inválido");
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

    private void requireGestor() {
        if (!CurrentUser.get().isGestor()) {
            throw ApiException.forbidden("Apenas gestores podem excluir tarefas");
        }
    }
}
