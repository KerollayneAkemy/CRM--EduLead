package com.edulead.security;

import com.edulead.controller.AnexoController;
import com.edulead.controller.AssistenteController;
import com.edulead.model.Usuario;
import com.edulead.repository.UsuarioRepository;
import com.edulead.service.AnexoService;
import com.edulead.service.AssistenteService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({AnexoController.class, AssistenteController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
@TestPropertySource(properties = {
        "edulead.jwt.secret=segredo-de-teste-com-pelo-menos-trinta-e-dois-caracteres",
        "edulead.cors.allowed-origin=http://localhost:5173"
})
class NewFeatureAuthorizationIntegrationTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private JwtService jwt;

    @MockitoBean
    private AnexoService anexos;

    @MockitoBean
    private AssistenteService assistente;

    @MockitoBean
    private AssistantRateLimiter assistantRateLimiter;

    @MockitoBean
    private UsuarioRepository usuarios;

    @BeforeEach
    void configureAuthenticatedUser() {
        Usuario user = new Usuario();
        user.id = 2L;
        user.cargo = "ATENDENTE";
        user.ativo = true;
        when(usuarios.findById(eq(2L))).thenReturn(Optional.of(user));
        when(anexos.allForInteressado(1L)).thenReturn(List.of());
        when(assistente.available()).thenReturn(false);
    }

    @Test
    void newFeatureEndpointsRejectRequestsWithoutJwt() throws Exception {
        mvc.perform(get("/api/interessados/1/anexos")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/assistente/status")).andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedAttendeeCanReachAuthorizedFeatureEndpoints() throws Exception {
        String token = jwt.generateToken(2L, "ATENDENTE");

        mvc.perform(get("/api/interessados/1/anexos").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        mvc.perform(get("/api/assistente/status").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
