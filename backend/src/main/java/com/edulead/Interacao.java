package com.edulead;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
class Interacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public String tipo;
    public String descricao;
    public LocalDateTime data = LocalDateTime.now();
    @ManyToOne(optional = false) public Interessado interessado;
}
