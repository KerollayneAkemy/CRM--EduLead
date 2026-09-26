package com.edulead.model;

public enum PerfilUsuario {
    GESTOR, ATENDENTE;

    public static PerfilUsuario from(String value) {
        if (value == null || value.isBlank()) return ATENDENTE;
        if ("GESTORA".equalsIgnoreCase(value) || "ADMIN".equalsIgnoreCase(value) || "GESTOR".equalsIgnoreCase(value)) return GESTOR;
        return PerfilUsuario.valueOf(value.toUpperCase());
    }
}
