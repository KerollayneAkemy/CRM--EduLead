package com.edulead.service;

import com.edulead.exception.ApiException;
import com.edulead.model.PerfilUsuario;
import com.edulead.model.Usuario;
import com.edulead.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> all() {
        return usuarios.findAll();
    }

    public Usuario create(Usuario usuario) {
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
            current.senha = passwordEncoder.encode(incoming.senha);
        }
        return usuarios.save(current);
    }

    public Usuario updateProfile(Long id, Usuario incoming) {
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
            if (incoming.senha.length() < 6) {
                throw ApiException.badRequest("A senha deve possuir ao menos 6 caracteres");
            }
            current.senha = passwordEncoder.encode(incoming.senha);
        }
        return usuarios.save(current);
    }

    public void delete(Long id) {
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

        if (passwordRequired && u.senha.length() < 6) {
            throw ApiException.badRequest("A senha deve possuir ao menos 6 caracteres");
        }

        try {
            PerfilUsuario.from(u.cargo);
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Perfil inválido. Use GESTOR ou ATENDENTE");
        }
    }
}
