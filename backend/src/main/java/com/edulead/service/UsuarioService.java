package com.edulead.service;

import com.edulead.exception.ApiException;
import com.edulead.model.PerfilUsuario;
import com.edulead.model.Usuario;
import com.edulead.repository.UsuarioRepository;
import com.edulead.security.CurrentUser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class UsuarioService {
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MAX_PASSWORD_BYTES = 72;

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> all() {
        requireGestor();
        return usuarios.findAll();
    }

    public Usuario create(Usuario usuario) {
        requireGestor();
        validate(usuario, true);

        if (usuarios.findByEmail(usuario.email.trim()).isPresent()) {
            throw ApiException.badRequest("Já existe usuário com este e-mail");
        }

        usuario.email = usuario.email.trim().toLowerCase();
        usuario.nome = usuario.nome.trim();
        usuario.senha = passwordEncoder.encode(usuario.senha);
        usuario.cargo = PerfilUsuario.from(usuario.cargo).name();

        return usuarios.save(usuario);
    }

    public Usuario update(Long id, Usuario incoming) {
        requireGestor();
        Usuario current = find(id);
        validate(incoming, false);

        if (incoming.email != null && !incoming.email.isBlank()
                && !current.email.equalsIgnoreCase(incoming.email.trim())
                && usuarios.findByEmail(incoming.email.trim()).isPresent()) {
            throw ApiException.badRequest("Já existe usuário com este e-mail");
        }

        current.nome = incoming.nome.trim();
        current.email = incoming.email.trim().toLowerCase();
        current.ativo = incoming.ativo;
        current.cargo = PerfilUsuario.from(incoming.cargo).name();

        if (incoming.senha != null && !incoming.senha.isBlank()) {
            validatePassword(incoming.senha);
            current.senha = passwordEncoder.encode(incoming.senha);
        }
        return usuarios.save(current);
    }

    public Usuario updateProfile(Long id, Usuario incoming) {
        // Perfil próprio: altera apenas credenciais, nunca cargo ou status do usuário.
        Usuario current = find(id);
        if (incoming.email == null || incoming.email.isBlank()) {
            throw ApiException.badRequest("E-mail é obrigatório");
        }

        String email = incoming.email.trim().toLowerCase();

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw ApiException.badRequest("E-mail inválido");
        }

        if (!current.email.equalsIgnoreCase(email) && usuarios.findByEmail(email).isPresent()) {
            throw ApiException.badRequest("Já existe usuário com este e-mail");
        }

        current.email = email;

        if (incoming.senha != null && !incoming.senha.isBlank()) {
            validatePassword(incoming.senha);
            // BCrypt impede que a senha original seja persistida no banco.
            current.senha = passwordEncoder.encode(incoming.senha);
        }
        return usuarios.save(current);
    }

    public void delete(Long id) {
        requireGestor();
        usuarios.delete(find(id));
    }

    public Usuario find(Long id) {
        return usuarios.findById(id).orElseThrow(() -> ApiException.notFound("Usuário"));
    }

    private void validate(Usuario u, boolean passwordRequired) {
        if (u.nome == null || u.nome.isBlank() || u.email == null || u.email.isBlank()
                || (passwordRequired && (u.senha == null || u.senha.isBlank()))) {
            throw ApiException.badRequest("Nome, e-mail e senha são obrigatórios");
        }

        if (!u.email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw ApiException.badRequest("E-mail inválido");
        }

        if (passwordRequired) {
            validatePassword(u.senha);
        } else if (u.senha != null && !u.senha.isBlank()) {
            validatePassword(u.senha);
        }

        try {
            PerfilUsuario.from(u.cargo);
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Perfil inválido. Use GESTOR ou ATENDENTE");
        }
    }

    private void requireGestor() {
        if (!CurrentUser.get().isGestor()) {
            throw ApiException.forbidden("Apenas gestores podem administrar usuários");
        }
    }

    private void validatePassword(String password) {
        if (password.length() < MIN_PASSWORD_LENGTH
                || password.getBytes(StandardCharsets.UTF_8).length > MAX_PASSWORD_BYTES) {
            throw ApiException.badRequest("A senha deve possuir ao menos 8 caracteres e no máximo 72 bytes");
        }
    }
}
