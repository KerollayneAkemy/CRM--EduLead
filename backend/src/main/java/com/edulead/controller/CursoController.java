package com.edulead.controller;

import com.edulead.model.Curso;
import com.edulead.service.CursoService;
import com.edulead.security.RequiresRole;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "${edulead.cors.allowed-origin}")
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
    @RequiresRole("GESTOR")
    public Curso create(@RequestBody Curso curso) {
        return cursos.create(curso);
    }

    @PutMapping("/{id}")
    @RequiresRole("GESTOR")
    public Curso update(@PathVariable Long id, @RequestBody Curso curso) {
        return cursos.update(id, curso);
    }

    @DeleteMapping("/{id}")
    @RequiresRole("GESTOR")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        cursos.delete(id);
    }
}
