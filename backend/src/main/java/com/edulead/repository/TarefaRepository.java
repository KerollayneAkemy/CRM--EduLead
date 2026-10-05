package com.edulead.repository;

import com.edulead.model.Tarefa;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByStatus(String status);
    List<Tarefa> findByInteressadoIdOrderByPrazoAsc(Long interessadoId);
    boolean existsByInteressadoId(Long interessadoId);
}
