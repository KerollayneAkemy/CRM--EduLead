package com.edulead;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
class Interessado {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    @Column(nullable = false) public String nome;
    public String telefone;
    public String email;
    public String turno;
    public String origem;
    public String etapa = "NOVO_INTERESSADO";
    public String observacoes;
    public LocalDate ultimoContato;
    public LocalDate proximoContato;
    @ManyToOne public Curso curso;
    @ManyToOne public Usuario responsavel;
}
