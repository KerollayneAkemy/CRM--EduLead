package com.edulead;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    @Column(nullable = false) public String nome;
    @Column(unique = true, nullable = false) public String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) public String senha;
    public String cargo = "ATENDENTE";
    public boolean ativo = true;
}
