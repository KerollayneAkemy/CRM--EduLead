package com.edulead.controller;

import com.edulead.model.Usuario;
import com.edulead.security.CurrentUser;
import com.edulead.service.UsuarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {
    private final UsuarioService usuarios;

    public PerfilController(UsuarioService usuarios) {
        this.usuarios = usuarios;
    }

    @GetMapping
    public Usuario current() {
        return usuarios.find(CurrentUser.get().id());
    }

    @PatchMapping
    public Usuario update(@RequestBody Usuario usuario) {
        return usuarios.updateProfile(CurrentUser.get().id(), usuario);
    }
}
