package com.edulead.security;

import com.edulead.exception.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Centraliza a leitura do usuário autenticado sem confiar em IDs enviados pelo cliente. */
public final class CurrentUser {
    private CurrentUser() {
    }

    public static AuthenticatedUser get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw ApiException.unauthorized("Usuário não autenticado");
        }
        return user;
    }
}
