package com.edulead.repository;

import com.edulead.model.Interessado;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteressadoRepository extends JpaRepository<Interessado, Long> {

    List<Interessado> findByResponsavelId(Long responsavelId);
}

