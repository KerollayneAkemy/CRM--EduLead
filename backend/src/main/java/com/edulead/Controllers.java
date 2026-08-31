package com.edulead;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
class AuthController {
    private final UsuarioRepository usuarios;
    AuthController(UsuarioRepository usuarios) { this.usuarios = usuarios; }

    @PostMapping("/login")
    Map<String, Object> login(@RequestBody Map<String, String> body) {
        Usuario usuario = usuarios.findByEmail(body.getOrDefault("email", ""))
                .orElseThrow(() -> ApiException.badRequest("E-mail ou senha inválidos"));
        if (!Objects.equals(usuario.senha, body.get("senha"))) {
            throw ApiException.badRequest("E-mail ou senha inválidos");
        }
        return Map.of("usuario", user(usuario), "token", "edulead-demo-session");
    }

    static Map<String, Object> user(Usuario usuario) {
        return Map.of("id", usuario.id, "nome", usuario.nome, "email", usuario.email, "cargo", usuario.cargo);
    }
}

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin
class CursoController {
    private final CursoRepository cursos;
    CursoController(CursoRepository cursos) { this.cursos = cursos; }
    @GetMapping List<Curso> all() { return cursos.findAll(); }
    @PostMapping Curso create(@RequestBody Curso curso) {
        if (curso.nome == null || curso.nome.isBlank()) throw ApiException.badRequest("Informe o nome do curso");
        return cursos.save(curso);
    }
    @PutMapping("/{id}") Curso update(@PathVariable Long id, @RequestBody Curso curso) { curso.id = id; return cursos.save(curso); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable Long id) { cursos.deleteById(id); }
}

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin
class UsuarioController {
    private final UsuarioRepository usuarios;
    UsuarioController(UsuarioRepository usuarios) { this.usuarios = usuarios; }
    @GetMapping List<Usuario> all() { return usuarios.findAll(); }
    @PostMapping Usuario create(@RequestBody Usuario usuario) {
        if (usuario.nome == null || usuario.email == null || usuario.senha == null) {
            throw ApiException.badRequest("Nome, e-mail e senha são obrigatórios");
        }
        return usuarios.save(usuario);
    }
    @PutMapping("/{id}") Usuario update(@PathVariable Long id, @RequestBody Usuario usuario) { usuario.id = id; return usuarios.save(usuario); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable Long id) { usuarios.deleteById(id); }
}

@RestController
@RequestMapping("/api/interessados")
@CrossOrigin
class InteressadoController {
    private final InteressadoRepository interessados;
    private final InteracaoRepository interacoes;
    private final TarefaRepository tarefas;
    InteressadoController(InteressadoRepository interessados, InteracaoRepository interacoes, TarefaRepository tarefas) {
        this.interessados = interessados; this.interacoes = interacoes; this.tarefas = tarefas;
    }
    @GetMapping List<Interessado> all() { return interessados.findAll(); }
    @GetMapping("/proximos-contatos") List<Interessado> followUps() {
        LocalDate limite = LocalDate.now().plusDays(7);
        return interessados.findAll().stream()
                .filter(item -> item.proximoContato != null && !"MATRICULA_REALIZADA".equals(item.etapa)
                        && !"DESISTIU".equals(item.etapa) && !item.proximoContato.isAfter(limite))
                .sorted(Comparator.comparing(item -> item.proximoContato)).toList();
    }
    @GetMapping("/{id}") Interessado one(@PathVariable Long id) { return find(id); }
    @PostMapping Interessado create(@RequestBody Interessado interessado) {
        if (interessado.nome == null || interessado.nome.isBlank() || interessado.telefone == null || interessado.telefone.isBlank()) {
            throw ApiException.badRequest("Nome e telefone são obrigatórios");
        }
        if (interessado.etapa == null) interessado.etapa = "NOVO_INTERESSADO";
        return interessados.save(interessado);
    }
    @PutMapping("/{id}") Interessado update(@PathVariable Long id, @RequestBody Interessado interessado) {
        if (!interessados.existsById(id)) throw ApiException.notFound("Interessado");
        interessado.id = id; return interessados.save(interessado);
    }
    @PatchMapping("/{id}/etapa") Interessado stage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String etapa = body.get("etapa");
        if (etapa == null || etapa.isBlank()) throw ApiException.badRequest("Etapa inválida");
        Interessado interessado = find(id); interessado.etapa = etapa; interessado.ultimoContato = LocalDate.now();
        return interessados.save(interessado);
    }
    @GetMapping("/{id}/interacoes") List<Interacao> history(@PathVariable Long id) { find(id); return interacoes.findByInteressadoIdOrderByDataDesc(id); }
    @GetMapping("/{id}/tarefas") List<Tarefa> tasks(@PathVariable Long id) { find(id); return tarefas.findByInteressadoIdOrderByPrazoAsc(id); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable Long id) { interessados.deleteById(id); }
    private Interessado find(Long id) { return interessados.findById(id).orElseThrow(() -> ApiException.notFound("Interessado")); }
}

@RestController
@RequestMapping("/api/interacoes")
@CrossOrigin
class InteracaoController {
    private final InteracaoRepository interacoes;
    InteracaoController(InteracaoRepository interacoes) { this.interacoes = interacoes; }
    @PostMapping Interacao create(@RequestBody Interacao interacao) {
        if (interacao.interessado == null || interacao.interessado.id == null) throw ApiException.badRequest("Selecione um interessado");
        if (interacao.tipo == null) interacao.tipo = "CONTATO";
        if (interacao.descricao == null || interacao.descricao.isBlank()) throw ApiException.badRequest("Descreva a interação");
        return interacoes.save(interacao);
    }
}

@RestController
@RequestMapping("/api/tarefas")
@CrossOrigin
class TarefaController {
    private final TarefaRepository tarefas;
    TarefaController(TarefaRepository tarefas) { this.tarefas = tarefas; }
    @GetMapping List<Tarefa> all() { return tarefas.findAll(); }
    @PostMapping Tarefa create(@RequestBody Tarefa tarefa) {
        if (tarefa.titulo == null || tarefa.titulo.isBlank()) throw ApiException.badRequest("Informe o título da tarefa");
        return tarefas.save(tarefa);
    }
    @PatchMapping("/{id}/concluir") Tarefa done(@PathVariable Long id) {
        Tarefa tarefa = tarefas.findById(id).orElseThrow(() -> ApiException.notFound("Tarefa"));
        tarefa.status = "CONCLUIDA"; return tarefas.save(tarefa);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable Long id) { tarefas.deleteById(id); }
}

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
class DashboardController {
    private final InteressadoRepository interessados;
    private final TarefaRepository tarefas;
    DashboardController(InteressadoRepository interessados, TarefaRepository tarefas) { this.interessados = interessados; this.tarefas = tarefas; }
    @GetMapping Map<String, Object> all() {
        List<Interessado> items = interessados.findAll();
        long matriculas = count(items, "MATRICULA_REALIZADA");
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalInteressados", items.size()); result.put("matriculas", matriculas); result.put("desistencias", count(items, "DESISTIU"));
        result.put("taxaConversao", items.isEmpty() ? 0 : Math.round(matriculas * 10000d / items.size()) / 100d);
        result.put("tarefasPendentes", tarefas.findByStatus("PENDENTE").size());
        result.put("porEtapa", group(items, item -> safe(item.etapa, "NOVO_INTERESSADO")));
        result.put("porCurso", group(items, item -> item.curso == null ? "Sem curso" : safe(item.curso.nome, "Sem curso")));
        result.put("porOrigem", group(items, item -> safe(item.origem, "Não informado")));
        return result;
    }
    private long count(List<Interessado> items, String etapa) { return items.stream().filter(item -> etapa.equals(item.etapa)).count(); }
    private Map<String, Long> group(List<Interessado> items, java.util.function.Function<Interessado, String> groupBy) {
        return items.stream().collect(Collectors.groupingBy(groupBy, LinkedHashMap::new, Collectors.counting()));
    }
    private String safe(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
}

@Configuration
class SeedData {
    @Bean CommandLineRunner seed(CursoRepository cursos, UsuarioRepository usuarios, InteressadoRepository interessados) {
        return args -> {
            if (usuarios.count() > 0) return;
            Curso administracao = new Curso(); administracao.nome = "Administração"; administracao.descricao = "Formação em gestão e negócios";
            Curso informatica = new Curso(); informatica.nome = "Informática"; informatica.descricao = "Tecnologia e desenvolvimento";
            cursos.saveAll(List.of(administracao, informatica));
            Usuario ana = new Usuario(); ana.nome = "Ana Martins"; ana.email = "ana@edulead.com"; ana.senha = "123456"; ana.cargo = "GESTORA"; usuarios.save(ana);
            Interessado marina = new Interessado(); marina.nome = "Marina Costa"; marina.telefone = "(92) 99999-1234"; marina.email = "marina@email.com";
            marina.origem = "Instagram"; marina.etapa = "PRIMEIRO_CONTATO"; marina.curso = administracao; marina.responsavel = ana; marina.proximoContato = LocalDate.now().plusDays(1);
            interessados.save(marina);
        };
    }
}
