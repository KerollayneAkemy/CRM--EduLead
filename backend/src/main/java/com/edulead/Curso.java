package com.edulead;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
class Curso {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public String nome;
    public String descricao;
    public boolean ativo = true;
}
