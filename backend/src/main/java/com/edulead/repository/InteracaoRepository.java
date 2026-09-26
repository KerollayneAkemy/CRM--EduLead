package com.edulead.repository;

import com.edulead.model.*;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteracaoRepository extends JpaRepository<Interacao, Long> {
    List<Interacao> findByInteressadoIdOrderByDataDesc(Long interessadoId);
    boolean existsByInteressadoId(Long interessadoId);
}

