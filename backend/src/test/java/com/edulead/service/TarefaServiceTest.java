package com.edulead.service;

import com.edulead.model.PerfilUsuario;
import com.edulead.model.Tarefa;
import com.edulead.model.Usuario;
import com.edulead.repository.TarefaRepository;
import com.edulead.security.AuthenticatedUser;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TarefaServiceTest {
    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void attendeeSeesOnlyOwnTasks() {
        TarefaRepository repository = mock(TarefaRepository.class);
        TarefaService service = new TarefaService(repository, mock(InteressadoService.class), mock(UsuarioService.class));
        authenticate(5L);
        when(repository.findByResponsavelId(5L)).thenReturn(List.of());

        assertEquals(List.of(), service.all());
    }

    @Test
    void attendeeCreationUsesAuthenticatedUserAsResponsible() {
        TarefaRepository repository = mock(TarefaRepository.class);
        UsuarioService usuarios = mock(UsuarioService.class);
        Usuario current = new Usuario();
        current.id = 5L;
        when(usuarios.find(5L)).thenReturn(current);
        when(repository.save(any(Tarefa.class))).thenAnswer(invocation -> invocation.getArgument(0));
        TarefaService service = new TarefaService(repository, mock(InteressadoService.class), usuarios);
        authenticate(5L);
        Tarefa tarefa = new Tarefa();
        tarefa.titulo = "Retornar ligação";

        assertEquals(5L, service.create(tarefa).responsavel.id);
    }

    @Test
    void rejectsUnknownTaskStatus() {
        TarefaService service = new TarefaService(mock(TarefaRepository.class), mock(InteressadoService.class),
                mock(UsuarioService.class));
        Tarefa tarefa = new Tarefa();
        tarefa.titulo = "Retornar ligação";
        tarefa.status = "INDEFINIDO";
        authenticate(5L);

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.create(tarefa));
    }

    private void authenticate(Long id) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new AuthenticatedUser(id, PerfilUsuario.ATENDENTE), null));
    }
}
