package com.edulead.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import java.time.LocalDateTime;

@Entity
public class HistoricoEtapa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false)
    public Interessado interessado;

    @Column(nullable = false)
    public String etapaAnterior;

    @Column(nullable = false)
    public String etapaNova;

    @Column(nullable = false)
    public LocalDateTime criadoEm;

    @PrePersist
    void defineDataDeCriacao() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }
}
