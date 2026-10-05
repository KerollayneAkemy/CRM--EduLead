package com.edulead.repository;

import com.edulead.model.Interacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteracaoRepository extends JpaRepository<Interacao, Long> {
    List<Interacao> findByInteressadoIdOrderByDataDesc(Long interessadoId);
    boolean existsByInteressadoId(Long interessadoId);
}

