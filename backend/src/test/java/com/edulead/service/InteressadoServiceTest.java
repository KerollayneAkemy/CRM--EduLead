package com.edulead.service;

import com.edulead.model.Interessado;
import com.edulead.repository.InteressadoRepository;
import com.edulead.repository.InteracaoRepository;
import com.edulead.repository.TarefaRepository;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class InteressadoServiceTest {
    private final InteressadoService service = new InteressadoService(
            mock(InteressadoRepository.class),
            mock(CursoService.class),
            mock(UsuarioService.class),
            mock(InteracaoRepository.class),
            mock(TarefaRepository.class));

    @Test
    void rejectsLeadWithoutNameOrPhone() {
        Interessado lead = new Interessado();
        lead.nome = ""; lead.telefone = "";
        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.create(lead));
    }

    @Test
    void rejectsUnknownPipelineStage() {
        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.changeStage(99L, "ETAPA_INEXISTENTE"));
    }
}
