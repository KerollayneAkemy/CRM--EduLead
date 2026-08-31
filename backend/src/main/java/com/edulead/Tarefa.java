package com.edulead;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
class Tarefa {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    @Column(nullable = false) public String titulo;
    public String descricao;
    public String status = "PENDENTE";
    public String prioridade = "NORMAL";
    public LocalDate prazo;
    @ManyToOne public Interessado interessado;
    @ManyToOne public Usuario responsavel;
}
