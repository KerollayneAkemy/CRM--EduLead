package com.edulead.controller;

import com.edulead.model.Interessado;
import com.edulead.model.Tarefa;
import com.edulead.service.InteressadoService;
import com.edulead.service.TarefaService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DashboardControllerTest {
    @Test
    void dashboardUsesTheRecordsProvidedByTheAccessControlledServices() {
        InteressadoService interessados = mock(InteressadoService.class);
        TarefaService tarefas = mock(TarefaService.class);
        Interessado ownLead = new Interessado();
        ownLead.etapa = "NOVO_INTERESSADO";
        Tarefa ownTask = new Tarefa();
        ownTask.status = "PENDENTE";
        when(interessados.all()).thenReturn(List.of(ownLead));
        when(tarefas.all()).thenReturn(List.of(ownTask));

        Map<String, Object> dashboard = new DashboardController(interessados, tarefas).all();

        assertEquals(1, dashboard.get("totalInteressados"));
        assertEquals(1L, dashboard.get("tarefasPendentes"));
    }
}
