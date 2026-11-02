package com.edulead.security;

import com.edulead.model.PerfilUsuario;

/** Dados mínimos extraídos do JWT para aplicar regras de acesso no backend. */
public record AuthenticatedUser(Long id, PerfilUsuario perfil) {
    public boolean isGestor() {
        return perfil == PerfilUsuario.GESTOR;
    }
}
