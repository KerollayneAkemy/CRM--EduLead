package com.edulead.repository;

import com.edulead.model.HistoricoEtapa;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoricoEtapaRepository extends JpaRepository<HistoricoEtapa, Long> {
    List<HistoricoEtapa> findByInteressadoIdOrderByCriadoEmDesc(Long interessadoId);
}
