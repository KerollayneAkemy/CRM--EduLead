package com.edulead.service;

import com.edulead.model.Curso;
import com.edulead.model.PerfilUsuario;
import com.edulead.repository.CursoRepository;
import com.edulead.security.AuthenticatedUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CursoServiceTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void managerCanCreateAndUpdateCourse() {
        CursoRepository repository = mock(CursoRepository.class);
        when(repository.save(any(Curso.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Curso existing = new Curso();
        existing.id = 1L;
        existing.nome = "Administração";
        existing.ativo = true;
        when(repository.findById(1L)).thenReturn(java.util.Optional.of(existing));
        CursoService service = new CursoService(repository);
        authenticateManager();

        Curso created = new Curso();
        created.nome = "Direito";
        assertEquals("Direito", service.create(created).nome);

        Curso update = new Curso();
        update.nome = "Direito Digital";
        update.descricao = "Curso atualizado";
        update.ativo = false;
        Curso saved = service.update(1L, update);

        assertEquals("Direito Digital", saved.nome);
        assertEquals("Curso atualizado", saved.descricao);
        assertEquals(false, saved.ativo);
    }

    @Test
    void preventsDeletingCourseWithLinkedLeads() {
        CursoRepository repository = mock(CursoRepository.class);
        Curso course = new Curso();
        course.id = 1L;
        when(repository.findById(1L)).thenReturn(java.util.Optional.of(course));
        doThrow(new DataIntegrityViolationException("foreign key")).when(repository).flush();
        CursoService service = new CursoService(repository);
        authenticateManager();

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.delete(1L));
    }

    @Test
    void managerCanDeleteCourseWithoutLinkedLeads() {
        CursoRepository repository = mock(CursoRepository.class);
        Curso course = new Curso();
        course.id = 1L;
        when(repository.findById(1L)).thenReturn(java.util.Optional.of(course));
        CursoService service = new CursoService(repository);
        authenticateManager();

        service.delete(1L);

        verify(repository).delete(course);
        verify(repository).flush();
    }

    private void authenticateManager() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        new AuthenticatedUser(1L, PerfilUsuario.GESTOR), null));
    }
}
