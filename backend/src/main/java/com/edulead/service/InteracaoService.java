package com.edulead.service;

import com.edulead.exception.ApiException;
import com.edulead.model.Interacao;
import com.edulead.repository.InteracaoRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InteracaoService {
    private final InteracaoRepository interacoes;
    private final InteressadoService interessados;

    public InteracaoService(InteracaoRepository interacoes, InteressadoService interessados) {
        this.interacoes = interacoes;
        this.interessados = interessados;
    }

    public Interacao create(Interacao item) {
        if (item.interessado == null || item.interessado.id == null) {
            throw ApiException.badRequest("Selecione um interessado");
        }
        if (item.descricao == null || item.descricao.isBlank()) {
            throw ApiException.badRequest("Descreva a interação");
        }

        item.interessado = interessados.find(item.interessado.id);
        if (item.tipo == null || item.tipo.isBlank()) {
            item.tipo = "CONTATO";
        }
        return interacoes.save(item);
    }

    public List<Interacao> history(Long interessadoId) {
        interessados.find(interessadoId);
        return interacoes.findByInteressadoIdOrderByDataDesc(interessadoId);
    }
}
