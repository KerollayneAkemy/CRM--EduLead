package com.edulead.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDate;

@Entity
public class Interessado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public String nome;

    public String telefone;
    public String email;
    public String turno;
    public String origem;
    public String etapa = "NOVO_INTERESSADO";
    public String observacoes;
    public LocalDate ultimoContato;
    public LocalDate proximoContato;
    // Muitos interessados podem demonstrar interesse pelo mesmo curso.
    @ManyToOne
    public Curso curso;

    // Cada interessado pode ser acompanhado por um usuário responsável.
    @ManyToOne
    public Usuario responsavel;
}
