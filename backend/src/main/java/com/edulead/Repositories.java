package com.edulead;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

interface CursoRepository extends JpaRepository<Curso, Long> {}

interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
}

interface InteressadoRepository extends JpaRepository<Interessado, Long> {}

interface InteracaoRepository extends JpaRepository<Interacao, Long> {
    List<Interacao> findByInteressadoIdOrderByDataDesc(Long interessadoId);
}

interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByStatus(String status);
    List<Tarefa> findByInteressadoIdOrderByPrazoAsc(Long interessadoId);
}
