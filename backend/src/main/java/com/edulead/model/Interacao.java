package com.edulead.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;

@Entity
public class Interacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String tipo;
    public String descricao;
    public LocalDateTime data = LocalDateTime.now();

    @ManyToOne(optional = false)
    public Interessado interessado;
}
