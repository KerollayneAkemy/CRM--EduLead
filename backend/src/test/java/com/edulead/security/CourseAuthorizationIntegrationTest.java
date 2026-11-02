package com.edulead.security;

import com.edulead.controller.CursoController;
import com.edulead.model.Curso;
import com.edulead.model.Usuario;
import com.edulead.repository.UsuarioRepository;
import com.edulead.service.CursoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CursoController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
@TestPropertySource(properties = {
        "edulead.jwt.secret=segredo-de-teste-com-pelo-menos-trinta-e-dois-caracteres",
        "edulead.cors.allowed-origin=http://localhost:5173"
})
class CourseAuthorizationIntegrationTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private JwtService jwt;

    @MockitoBean
    private CursoService cursos;

    @MockitoBean
    private UsuarioRepository usuarios;

    @BeforeEach
    void configureAuthenticatedUsers() {
        when(usuarios.findById(eq(1L))).thenReturn(java.util.Optional.of(user(1L, "GESTOR")));
        when(usuarios.findById(eq(2L))).thenReturn(java.util.Optional.of(user(2L, "ATENDENTE")));
    }

    @Test
    void requestWithoutTokenIsRejected() throws Exception {
        mvc.perform(get("/api/cursos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void attendeeMayConsultCoursesButCannotManageThem() throws Exception {
        String token = jwt.generateToken(2L, "ATENDENTE");

        mvc.perform(get("/api/cursos").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        mvc.perform(post("/api/cursos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Direito\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void managerMayManageCourses() throws Exception {
        Curso saved = new Curso();
        saved.id = 1L;
        saved.nome = "Direito";
        when(cursos.create(any(Curso.class))).thenReturn(saved);
        String token = jwt.generateToken(1L, "GESTOR");

        mvc.perform(post("/api/cursos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Direito\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void inactiveOrUnknownTokenSubjectIsRejected() throws Exception {
        Usuario inactive = user(3L, "ATENDENTE");
        inactive.ativo = false;
        when(usuarios.findById(3L)).thenReturn(java.util.Optional.of(inactive));

        mvc.perform(get("/api/cursos").header("Authorization", "Bearer " + jwt.generateToken(3L, "ATENDENTE")))
                .andExpect(status().isUnauthorized());
    }

    private Usuario user(Long id, String cargo) {
        Usuario user = new Usuario();
        user.id = id;
        user.cargo = cargo;
        user.ativo = true;
        return user;
    }
}
