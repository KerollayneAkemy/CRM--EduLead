package com.edulead.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.edulead.model.HistoricoEtapa;
import com.edulead.model.Interessado;
import com.edulead.repository.HistoricoEtapaRepository;
import java.util.List;
import org.junit.jupiter.api.Test;

class HistoricoEtapaServiceTest {
    @Test
    void registersThePreviousAndNewPipelineStages() {
        HistoricoEtapaRepository repository = mock(HistoricoEtapaRepository.class);
        HistoricoEtapaService service = new HistoricoEtapaService(repository, mock(InteressadoService.class));
        Interessado interessado = new Interessado();
        interessado.id = 5L;
        interessado.etapa = "PRIMEIRO_CONTATO";

        service.register(interessado, "NOVO_INTERESSADO");

        org.mockito.ArgumentCaptor<HistoricoEtapa> item = org.mockito.ArgumentCaptor.forClass(HistoricoEtapa.class);
        verify(repository).save(item.capture());
        assertEquals("NOVO_INTERESSADO", item.getValue().etapaAnterior);
        assertEquals("PRIMEIRO_CONTATO", item.getValue().etapaNova);
        assertEquals(interessado, item.getValue().interessado);
    }

    @Test
    void readsOnlyTheAuthorizedInterestedHistory() {
        HistoricoEtapaRepository repository = mock(HistoricoEtapaRepository.class);
        InteressadoService interessados = mock(InteressadoService.class);
        HistoricoEtapaService service = new HistoricoEtapaService(repository, interessados);
        when(repository.findByInteressadoIdOrderByCriadoEmDesc(5L)).thenReturn(List.of());

        assertEquals(List.of(), service.allForInteressado(5L));
        verify(interessados).find(5L);
    }
}
