package com.edulead.controller;

import com.edulead.model.Usuario;
import com.edulead.service.UsuarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/perfil")
@CrossOrigin(origins = "${edulead.cors.allowed-origin}")
public class PerfilController {
    private final UsuarioService usuarios;

    public PerfilController(UsuarioService usuarios) { this.usuarios = usuarios; }

    @GetMapping
    public Usuario current(@RequestAttribute("userId") String userId) {
        return usuarios.find(Long.valueOf(userId));
    }

    @PatchMapping
    public Usuario update(@RequestAttribute("userId") String userId, @RequestBody Usuario usuario) {
        return usuarios.updateProfile(Long.valueOf(userId), usuario);
    }
}
