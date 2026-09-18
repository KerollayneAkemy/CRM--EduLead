package com.edulead.controller;

import com.edulead.model.*;
import com.edulead.service.UsuarioService;
import com.edulead.security.RequiresRole;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "${edulead.cors.allowed-origin}")
@RequiresRole("GESTOR")
public class UsuarioController {
    private final UsuarioService usuarios;

    public UsuarioController(UsuarioService usuarios) { 
        this.usuarios = usuarios; 
    }

    @GetMapping 
    public List<Usuario> all() { 
        return usuarios.all(); 
    }

    @PostMapping 
    public Usuario create(@RequestBody Usuario usuario) {
        return usuarios.create(usuario);
    }

    @PutMapping("/{id}") 
    public Usuario update(@PathVariable Long id, @RequestBody Usuario usuario) { 
        return usuarios.update(id, usuario); 
    }

    @DeleteMapping("/{id}") 
    @ResponseStatus(HttpStatus.NO_CONTENT) 
    public void delete(@PathVariable Long id) { 
        usuarios.delete(id); 
    }
}
