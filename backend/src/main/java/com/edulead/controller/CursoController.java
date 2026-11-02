package com.edulead.controller;

import com.edulead.model.Curso;
import com.edulead.service.CursoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {

    private final CursoService cursos;

    public CursoController(CursoService cursos) {
        this.cursos = cursos;
    }

    @GetMapping
    public List<Curso> all() {
        return cursos.all();
    }

    @PostMapping
    public Curso create(@RequestBody Curso curso) {
        return cursos.create(curso);
    }

    @PutMapping("/{id}")
    public Curso update(@PathVariable Long id, @RequestBody Curso curso) {
        return cursos.update(id, curso);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        cursos.delete(id);
    }
}
