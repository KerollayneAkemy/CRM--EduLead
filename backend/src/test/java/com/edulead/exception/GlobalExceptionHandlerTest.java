package com.edulead.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {
    @Test
    void formatsExpectedClientErrorsWithoutInternalDetails() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/interessados");

        ResponseEntity<Map<String, Object>> response = new GlobalExceptionHandler()
                .responseStatus(ApiException.badRequest("Nome obrigatório"), request);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Nome obrigatório", response.getBody().get("message"));
        assertEquals("/api/interessados", response.getBody().get("path"));
    }

    @Test
    void formatsMalformedJsonAsBadRequest() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/tarefas");

        ResponseEntity<Map<String, Object>> response = new GlobalExceptionHandler()
                .invalidRequest(mock(HttpMessageNotReadableException.class), request);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Dados da requisição inválidos", response.getBody().get("message"));
    }
}
