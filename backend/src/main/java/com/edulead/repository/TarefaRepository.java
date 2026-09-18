package com.edulead.repository;

import com.edulead.model.*;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByStatus(String status);
    List<Tarefa> findByInteressadoIdOrderByPrazoAsc(Long interessadoId);
    boolean existsByInteressadoId(Long interessadoId);
}
