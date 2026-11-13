package com.edulead.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AssistenteServiceTest {
    @Test
    void forwardsOnlyAValidQuestionToTheConfiguredProvider() {
        AssistantProvider provider = mock(AssistantProvider.class);
        when(provider.answer(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.eq("Como funciona o funil?")))
                .thenReturn("Use as etapas para acompanhar o interessado.");

        assertEquals("Use as etapas para acompanhar o interessado.",
                new AssistenteService(provider).ask(" Como funciona o funil? "));
    }

    @Test
    void rejectsEmptyOrOversizedQuestions() {
        AssistenteService service = new AssistenteService(mock(AssistantProvider.class));

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.ask(""));
        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.ask("a".repeat(1001)));
    }

    @Test
    void rejectsQuestionsContainingEmailOrPhoneBeforeCallingProvider() {
        AssistenteService service = new AssistenteService(mock(AssistantProvider.class));

        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> service.ask("Qual o status de ana@edulead.com?"));
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> service.ask("Ligue para 92999998888"));
    }

    @Test
    void sendsTheProductKnowledgeBaseToTheProvider() {
        AssistantProvider provider = mock(AssistantProvider.class);
        when(provider.answer(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("Resposta");

        new AssistenteService(provider).ask("Como funcionam os cursos?");

        org.mockito.ArgumentCaptor<String> instruction = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(provider).answer(instruction.capture(), org.mockito.ArgumentMatchers.eq("Como funcionam os cursos?"));

        assertTrue(instruction.getValue().contains("Dashboard"));
        assertTrue(instruction.getValue().contains("Funil"));
        assertTrue(instruction.getValue().contains("Anexos"));
        assertTrue(instruction.getValue().contains("GESTOR"));
        assertTrue(instruction.getValue().contains("ATENDENTE"));
    }

    @Test
    void givesAnExactGuideForAttachments() {
        AssistantProvider provider = mock(AssistantProvider.class);
        when(provider.isAvailable()).thenReturn(true);

        String answer = new AssistenteService(provider).ask("Onde ficam os anexos?");

        assertTrue(answer.contains("Interessados"));
        assertTrue(answer.contains("Abrir ficha"));
        assertTrue(answer.contains("Anexos"));
    }
}
