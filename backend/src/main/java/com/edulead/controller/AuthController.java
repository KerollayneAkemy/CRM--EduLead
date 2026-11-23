package com.edulead.controller;

import com.edulead.exception.ApiException;
import com.edulead.model.PerfilUsuario;
import com.edulead.model.Usuario;
import com.edulead.repository.UsuarioRepository;
import com.edulead.security.LoginAttemptLimiter;
import com.edulead.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final int MAX_EMAIL_LENGTH = 254;
    private static final int MAX_PASSWORD_BYTES = 72;

    private final UsuarioRepository usuarios;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptLimiter loginAttempts;

    public AuthController(UsuarioRepository usuarios, JwtService jwtService, PasswordEncoder passwordEncoder,
            LoginAttemptLimiter loginAttempts) {
        this.usuarios = usuarios;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.loginAttempts = loginAttempts;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request) {
        String email = value(body, "email").trim().toLowerCase();
        String senha = value(body, "senha");
        String attemptKey = attemptKey(email, request);
        loginAttempts.checkAllowed(attemptKey);

        if (email.isBlank() || email.length() > MAX_EMAIL_LENGTH || senha.isBlank()
                || senha.getBytes(StandardCharsets.UTF_8).length > MAX_PASSWORD_BYTES) {
            throw invalidCredentials(attemptKey);
        }

        Usuario usuario = usuarios.findByEmail(email).orElse(null);
        if (usuario == null || !matches(senha, usuario.senha) || !usuario.ativo) {
            throw invalidCredentials(attemptKey);
        }

        // Senhas legadas em texto são migradas para BCrypt somente após uma validação válida.
        if (!isBcryptHash(usuario.senha)) {
            usuario.senha = passwordEncoder.encode(senha);
            usuarios.save(usuario);
        }

        loginAttempts.clear(attemptKey);
        String cargo = PerfilUsuario.from(usuario.cargo).name();
        String token = jwtService.generateToken(usuario.id, cargo);
        return Map.of("usuario", user(usuario), "token", token);
    }

    private boolean matches(String suppliedPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }
        if (isBcryptHash(storedPassword)) {
            return passwordEncoder.matches(suppliedPassword, storedPassword);
        }
        return MessageDigest.isEqual(suppliedPassword.getBytes(StandardCharsets.UTF_8),
                storedPassword.getBytes(StandardCharsets.UTF_8));
    }

    private boolean isBcryptHash(String value) {
        return value != null && (value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$"));
    }

    private RuntimeException invalidCredentials(String attemptKey) {
        loginAttempts.recordFailure(attemptKey);
        return ApiException.unauthorized("E-mail ou senha inválidos");
    }

    private String value(Map<String, String> body, String key) {
        return body == null || body.get(key) == null ? "" : body.get(key);
    }

    private String attemptKey(String email, HttpServletRequest request) {
        String realIp = request.getHeader("X-Real-IP");
        String source = realIp == null || realIp.isBlank() ? request.getRemoteAddr() : realIp.trim();
        return (source == null ? "unknown" : source) + "|" + email;
    }

    static Map<String, Object> user(Usuario usuario) {
        return Map.of("id", usuario.id, "nome", usuario.nome, "email", usuario.email, "cargo", usuario.cargo);
    }
}
