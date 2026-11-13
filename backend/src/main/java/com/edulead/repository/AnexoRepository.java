package com.edulead.repository;

import com.edulead.model.Anexo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnexoRepository extends JpaRepository<Anexo, Long> {
    List<Anexo> findByInteressadoIdOrderByCriadoEmDesc(Long interessadoId);
}
