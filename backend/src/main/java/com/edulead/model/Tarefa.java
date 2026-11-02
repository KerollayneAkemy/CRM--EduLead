package com.edulead.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDate;

@Entity
public class Tarefa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(nullable = false)
    public String titulo;

    public String descricao;
    public String status = "PENDENTE";
    public String prioridade = "NORMAL";
    public LocalDate prazo;

    @ManyToOne
    public Interessado interessado;

    @ManyToOne
    public Usuario responsavel;
}
