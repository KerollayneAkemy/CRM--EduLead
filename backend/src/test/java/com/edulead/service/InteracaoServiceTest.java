package com.edulead.service;

import com.edulead.model.Interacao;
import com.edulead.model.Interessado;
import com.edulead.repository.InteracaoRepository;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class InteracaoServiceTest {
    @Test
    void historyChecksAccessToLeadBeforeReturningInteractions() {
        InteracaoRepository repository = mock(InteracaoRepository.class);
        InteressadoService interessados = mock(InteressadoService.class);
        when(repository.findByInteressadoIdOrderByDataDesc(8L)).thenReturn(List.of());

        assertEquals(List.of(), new InteracaoService(repository, interessados).history(8L));

        // InteressadoService aplica o isolamento por responsável para ATENDENTE.
        verify(interessados).find(8L);
    }
}
