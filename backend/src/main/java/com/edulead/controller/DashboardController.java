package com.edulead.controller;

import com.edulead.model.Interessado;
import com.edulead.repository.InteressadoRepository;
import com.edulead.repository.TarefaRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "${edulead.cors.allowed-origin}")
public class DashboardController {
    private final InteressadoRepository interessados;
    private final TarefaRepository tarefas;
    DashboardController(InteressadoRepository interessados, TarefaRepository tarefas) { this.interessados = interessados; this.tarefas = tarefas; }
    @GetMapping Map<String, Object> all() {
        List<Interessado> items = interessados.findAll();
        long matriculas = count(items, "MATRICULA_REALIZADA");
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalInteressados", items.size()); result.put("matriculas", matriculas); result.put("desistencias", count(items, "DESISTIU"));
        result.put("taxaConversao", items.isEmpty() ? 0 : Math.round(matriculas * 10000d / items.size()) / 100d);
        result.put("tarefasPendentes", tarefas.findByStatus("PENDENTE").size());
        result.put("porEtapa", group(items, item -> safe(item.etapa, "NOVO_INTERESSADO")));
        result.put("porCurso", group(items, item -> item.curso == null ? "Sem curso" : safe(item.curso.nome, "Sem curso")));
        result.put("porOrigem", group(items, item -> safe(item.origem, "Não informado")));
        return result;
    }
    private long count(List<Interessado> items, String etapa) { return items.stream().filter(item -> etapa.equals(item.etapa)).count(); }
    private Map<String, Long> group(List<Interessado> items, java.util.function.Function<Interessado, String> groupBy) {
        return items.stream().collect(Collectors.groupingBy(groupBy, LinkedHashMap::new, Collectors.counting()));
    }
    private String safe(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
}

