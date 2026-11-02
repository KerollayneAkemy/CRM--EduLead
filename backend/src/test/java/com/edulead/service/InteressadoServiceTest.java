package com.edulead.service;

import com.edulead.model.Interessado;
import com.edulead.model.PerfilUsuario;
import com.edulead.model.Usuario;
import com.edulead.repository.InteressadoRepository;
import com.edulead.repository.InteracaoRepository;
import com.edulead.repository.TarefaRepository;
import com.edulead.security.AuthenticatedUser;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class InteressadoServiceTest {
    private final InteressadoService service = new InteressadoService(
            mock(InteressadoRepository.class), mock(CursoService.class), mock(UsuarioService.class),
            mock(InteracaoRepository.class), mock(TarefaRepository.class));

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rejectsLeadWithoutNameOrPhone() {
        Interessado lead = new Interessado();
        lead.nome = "";
        lead.telefone = "";

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.create(lead));
    }

    @Test
    void rejectsUnknownPipelineStage() {
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> service.changeStage(99L, "ETAPA_INEXISTENTE"));
    }

    @Test
    void attendeeSeesOnlyOwnLeads() {
        InteressadoRepository repository = mock(InteressadoRepository.class);
        InteressadoService isolatedService = new InteressadoService(repository, mock(CursoService.class),
                mock(UsuarioService.class), mock(InteracaoRepository.class), mock(TarefaRepository.class));
        authenticate(7L, PerfilUsuario.ATENDENTE);
        when(repository.findByResponsavelId(7L)).thenReturn(List.of());

        isolatedService.all();

        verify(repository).findByResponsavelId(7L);
    }

    @Test
    void attendeeCannotReadAnotherUsersLead() {
        InteressadoRepository repository = mock(InteressadoRepository.class);
        Interessado lead = new Interessado();
        lead.id = 10L;
        lead.responsavel = user(9L);
        when(repository.findById(10L)).thenReturn(java.util.Optional.of(lead));
        InteressadoService isolatedService = new InteressadoService(repository, mock(CursoService.class),
                mock(UsuarioService.class), mock(InteracaoRepository.class), mock(TarefaRepository.class));
        authenticate(7L, PerfilUsuario.ATENDENTE);

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> isolatedService.find(10L));
    }

    @Test
    void attendeeCreationUsesAuthenticatedUserAsResponsible() {
        InteressadoRepository repository = mock(InteressadoRepository.class);
        UsuarioService usuarios = mock(UsuarioService.class);
        Usuario authenticated = user(7L);
        when(usuarios.find(7L)).thenReturn(authenticated);
        when(repository.save(any(Interessado.class))).thenAnswer(invocation -> invocation.getArgument(0));
        InteressadoService isolatedService = new InteressadoService(repository, mock(CursoService.class), usuarios,
                mock(InteracaoRepository.class), mock(TarefaRepository.class));
        Interessado lead = new Interessado();
        lead.nome = "Carla";
        lead.telefone = "99999-9999";
        lead.responsavel = user(99L); // o valor enviado pelo cliente não é confiado
        authenticate(7L, PerfilUsuario.ATENDENTE);

        assertEquals(7L, isolatedService.create(lead).responsavel.id);
    }

    @Test
    void attendeeCannotTransferLeadToAnotherUser() {
        InteressadoRepository repository = mock(InteressadoRepository.class);
        UsuarioService usuarios = mock(UsuarioService.class);
        Interessado current = new Interessado();
        current.id = 10L;
        current.responsavel = user(7L);
        when(repository.findById(10L)).thenReturn(java.util.Optional.of(current));
        when(usuarios.find(7L)).thenReturn(current.responsavel);
        when(repository.save(any(Interessado.class))).thenAnswer(invocation -> invocation.getArgument(0));
        InteressadoService isolatedService = new InteressadoService(repository, mock(CursoService.class), usuarios,
                mock(InteracaoRepository.class), mock(TarefaRepository.class));
        Interessado incoming = new Interessado();
        incoming.nome = "Carla";
        incoming.telefone = "99999-9999";
        incoming.responsavel = user(99L);
        authenticate(7L, PerfilUsuario.ATENDENTE);

        assertEquals(7L, isolatedService.update(10L, incoming).responsavel.id);
    }

    private void authenticate(Long id, PerfilUsuario perfil) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new AuthenticatedUser(id, perfil), null));
    }

    private Usuario user(Long id) {
        Usuario user = new Usuario();
        user.id = id;
        return user;
    }
}
