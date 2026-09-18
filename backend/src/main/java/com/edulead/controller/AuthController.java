package com.edulead.controller;

import com.edulead.model.PerfilUsuario;
import com.edulead.model.Usuario;
import com.edulead.exception.ApiException;
import com.edulead.repository.UsuarioRepository;
import com.edulead.security.JwtService;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${edulead.cors.allowed-origin}")
public class AuthController {
    private final UsuarioRepository usuarios;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    
    public AuthController(UsuarioRepository usuarios, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.usuarios = usuarios;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        Usuario usuario = usuarios.findByEmail(body.getOrDefault("email", ""))
                .orElseThrow(() -> ApiException.badRequest("E-mail ou senha inválidos"));
        String senha = body.get("senha");
        if (senha == null || !passwordEncoder.matches(senha, usuario.senha)) {
            // Compatibilidade temporária: um hash legado é migrado após o primeiro login válido.
            if (senha == null || !senha.equals(usuario.senha)) {
                throw ApiException.badRequest("E-mail ou senha inválidos");
            }
            usuario.senha = passwordEncoder.encode(senha);
            usuarios.save(usuario);
        }
        if (!usuario.ativo) {
            throw ApiException.forbidden("Usuário inativo");
        }
        String cargo = PerfilUsuario.from(usuario.cargo).name();
        String token = jwtService.generateToken(usuario.id, cargo);
        return Map.of("usuario", user(usuario), "token", token);
    }

    static Map<String, Object> user(Usuario usuario) {
        return Map.of("id", usuario.id, "nome", usuario.nome, "email", usuario.email, "cargo", usuario.cargo);
    }
}
