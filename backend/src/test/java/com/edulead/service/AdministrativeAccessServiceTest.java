package com.edulead.service;

import com.edulead.model.Curso;
import com.edulead.model.PerfilUsuario;
import com.edulead.model.Usuario;
import com.edulead.repository.CursoRepository;
import com.edulead.repository.UsuarioRepository;
import com.edulead.security.AuthenticatedUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class AdministrativeAccessServiceTest {
    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void attendeeCannotAdministerCoursesOutsideTheController() {
        authenticate(2L, PerfilUsuario.ATENDENTE);
        Curso course = new Curso();
        course.nome = "Direito";

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> new CursoService(mock(CursoRepository.class)).create(course));

        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void attendeeCannotListUsersOutsideTheController() {
        authenticate(2L, PerfilUsuario.ATENDENTE);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> new UsuarioService(mock(UsuarioRepository.class), mock(PasswordEncoder.class)).all());

        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void gestorCannotCreateANewUserWithAWeakPassword() {
        authenticate(1L, PerfilUsuario.GESTOR);
        Usuario incoming = new Usuario();
        incoming.nome = "Novo usuário";
        incoming.email = "novo@edulead.com";
        incoming.senha = "1234567";
        incoming.cargo = "ATENDENTE";

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> new UsuarioService(mock(UsuarioRepository.class), mock(PasswordEncoder.class)).create(incoming));

        assertEquals(400, exception.getStatusCode().value());
    }

    private void authenticate(Long id, PerfilUsuario profile) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new AuthenticatedUser(id, profile), null));
    }
}
