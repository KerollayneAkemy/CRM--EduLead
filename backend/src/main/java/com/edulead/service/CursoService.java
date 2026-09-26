package com.edulead.service;

import com.edulead.exception.ApiException;
import com.edulead.model.Curso;
import com.edulead.repository.CursoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CursoService {
    private final CursoRepository cursos;

    public CursoService(CursoRepository cursos) {
        this.cursos = cursos;
    }

    public List<Curso> all() {
        return cursos.findAll();
    }

    public Curso create(Curso curso) {
        validate(curso);
        return cursos.save(curso);
    }

    public Curso update(Long id, Curso incoming) {
        Curso current = find(id);
        validate(incoming);
        current.nome = incoming.nome.trim();
        current.descricao = incoming.descricao;
        current.ativo = incoming.ativo;
        return cursos.save(current);
    }

    public void delete(Long id) {
        try {
            cursos.delete(find(id));
            cursos.flush();
        } catch (DataIntegrityViolationException e) {
            throw ApiException.badRequest("Não é possível excluir este curso pois existem interessados vinculados a ele. Recomendamos arquivá-lo.");
        }
    }

    public Curso find(Long id) {
        return cursos.findById(id).orElseThrow(() -> ApiException.notFound("Curso"));
    }

    private void validate(Curso curso) {
        if (curso.nome == null || curso.nome.isBlank()) {
            throw ApiException.badRequest("Informe o nome do curso");
        }
    }
}
