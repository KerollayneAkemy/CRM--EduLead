package com.edulead.repository;

import com.edulead.model.Tarefa;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    List<Tarefa> findByResponsavelId(Long responsavelId);

    List<Tarefa> findByInteressadoIdOrderByPrazoAsc(Long interessadoId);

    List<Tarefa> findByInteressadoIdAndResponsavelIdOrderByPrazoAsc(Long interessadoId, Long responsavelId);

    boolean existsByInteressadoId(Long interessadoId);
}
