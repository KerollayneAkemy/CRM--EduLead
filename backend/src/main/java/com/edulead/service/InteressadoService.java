package com.edulead.service;

import com.edulead.exception.ApiException;
import com.edulead.model.*;
import com.edulead.repository.InteressadoRepository;
import com.edulead.repository.InteracaoRepository;
import com.edulead.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class InteressadoService {

    private final InteressadoRepository interessados;
    private final CursoService cursos;
    private final UsuarioService usuarios;
    private final InteracaoRepository interacoes;
    private final TarefaRepository tarefas;

    public InteressadoService(InteressadoRepository interessados, CursoService cursos, UsuarioService usuarios, InteracaoRepository interacoes, TarefaRepository tarefas) {
        this.interessados = interessados;
        this.cursos = cursos;
        this.usuarios = usuarios;
        this.interacoes = interacoes;
        this.tarefas = tarefas;
    }

    public List<Interessado> all() {
        return interessados.findAll();
    }

    public Interessado find(Long id) {
        return interessados.findById(id).orElseThrow(() -> ApiException.notFound("Interessado"));
    }

    public List<Interessado> followUps() {
        LocalDate limit = LocalDate.now().plusDays(7);
        return interessados.findAll().stream().filter(i -> i.proximoContato != null && i.proximoContato.compareTo(limit) <= 0 && !EtapaFunil.MATRICULA_REALIZADA.name().equals(i.etapa) && !EtapaFunil.DESISTIU.name().equals(i.etapa)).sorted(Comparator.comparing(i -> i.proximoContato)).toList();
    }

    public Interessado create(Interessado incoming) {
        validate(incoming);
        if (incoming.etapa == null || incoming.etapa.isBlank()) {
            incoming.etapa = EtapaFunil.NOVO_INTERESSADO.name();
        
        }resolveRelations(incoming);
        return interessados.save(incoming);
    }

    public Interessado update(Long id, Interessado incoming) {
        Interessado current = find(id);
        validate(incoming);
        resolveRelations(incoming);
        incoming.id = current.id;
        return interessados.save(incoming);
    }

    public Interessado changeStage(Long id, String etapa) {
        Interessado item = find(id);
        item.etapa = stage(etapa);
        item.ultimoContato = LocalDate.now();
        return interessados.save(item);
    }

    public void delete(Long id) {
        Interessado interessado = find(id);
        // Preserva histórico de atendimento e evita exclusões acidentais de dados relacionados.
        if (interacoes.existsByInteressadoId(id) || tarefas.existsByInteressadoId(id)) {
            throw ApiException.badRequest("Não é possível excluir este interessado pois há histórico ou tarefas vinculadas a ele.");
        }
        interessados.delete(interessado);
    }

    private void validate(Interessado item) {
        if (item.nome == null || item.nome.isBlank() || item.telefone == null || item.telefone.isBlank()) {
            throw ApiException.badRequest("Nome e telefone são obrigatórios");
        }
        if (item.email != null && !item.email.isBlank() && !item.email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw ApiException.badRequest("E-mail inválido");
        }
        if (item.etapa != null && !item.etapa.isBlank()) {
            item.etapa = stage(item.etapa);
        }
    }

    private String stage(String value) {
        try {
            return EtapaFunil.valueOf(value).name();
        } catch (IllegalArgumentException | NullPointerException e) {
            throw ApiException.badRequest("Etapa inválida");
        }
    }

    private void resolveRelations(Interessado item) {
        if (item.curso != null) {
            if (item.curso.id == null) {
                throw ApiException.badRequest("Curso inválido");
            
            }
            item.curso = cursos.find(item.curso.id);
        }

        if (item.responsavel != null) {
            if (item.responsavel.id == null) {
                throw ApiException.badRequest("Responsável inválido");
            
            }
        
            item.responsavel = usuarios.find(item.responsavel.id);
        }
    }
}
