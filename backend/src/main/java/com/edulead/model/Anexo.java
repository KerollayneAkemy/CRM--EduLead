package com.edulead.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

/** Metadados de um arquivo privado; o conteúdo permanece no armazenamento R2. */
@Entity
public class Anexo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 255)
    public String nomeOriginal;

    @Column(nullable = false, length = 120)
    public String tipoMime;

    @Column(nullable = false)
    public long tamanho;

    @Column(nullable = false, unique = true, length = 512)
    public String objectKey;

    @Column(nullable = false)
    public LocalDateTime criadoEm = LocalDateTime.now();

    @ManyToOne(optional = false)
    public Interessado interessado;

    @ManyToOne(optional = false)
    public Usuario enviadoPor;
}
