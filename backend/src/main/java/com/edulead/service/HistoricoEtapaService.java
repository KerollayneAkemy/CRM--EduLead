package com.edulead.service;

import com.edulead.model.HistoricoEtapa;
import com.edulead.model.Interessado;
import com.edulead.repository.HistoricoEtapaRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class HistoricoEtapaService {
    private final HistoricoEtapaRepository historicos;
    private final InteressadoService interessados;

    public HistoricoEtapaService(HistoricoEtapaRepository historicos, InteressadoService interessados) {
        this.historicos = historicos;
        this.interessados = interessados;
    }

    public void register(Interessado interessado, String etapaAnterior) {
        HistoricoEtapa historico = new HistoricoEtapa();
        historico.interessado = interessado;
        historico.etapaAnterior = etapaAnterior;
        historico.etapaNova = interessado.etapa;
        historicos.save(historico);
    }

    public List<HistoricoEtapa> allForInteressado(Long interessadoId) {
        interessados.find(interessadoId);
        return historicos.findByInteressadoIdOrderByCriadoEmDesc(interessadoId);
    }
}
