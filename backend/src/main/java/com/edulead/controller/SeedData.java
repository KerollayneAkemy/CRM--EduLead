package com.edulead.controller;

import com.edulead.model.Curso;
import com.edulead.model.Interessado;
import com.edulead.model.Usuario;
import com.edulead.repository.CursoRepository;
import com.edulead.repository.InteressadoRepository;
import com.edulead.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedData {

    @Bean
    CommandLineRunner seed(CursoRepository cursos, UsuarioRepository usuarios, InteressadoRepository interessados,
            PasswordEncoder passwordEncoder) {

        return args -> {
            // Não sobrescreve dados existentes; a demonstração é criada somente no primeiro
            // uso.

            if (usuarios.count() > 0) {
                return;
            }

            Curso administracao = new Curso();
            administracao.nome = "Administração";
            administracao.descricao = "Formação em gestão e negócios";
            Curso informatica = new Curso();
            informatica.nome = "Informática";
            informatica.descricao = "Tecnologia e desenvolvimento";
            cursos.saveAll(List.of(administracao, informatica));

            Usuario ana = new Usuario();
            ana.nome = "Ana Martins";
            ana.email = "ana@edulead.com";
            ana.senha = passwordEncoder.encode("123456");
            ana.cargo = "GESTOR";
            usuarios.save(ana);

            Interessado marina = new Interessado();
            marina.nome = "Marina Costa";
            marina.telefone = "(92) 99999-1234";
            marina.email = "marina@email.com";
            marina.origem = "Instagram";
            marina.etapa = "PRIMEIRO_CONTATO";
            marina.curso = administracao;
            marina.responsavel = ana;
            marina.proximoContato = LocalDate.now().plusDays(1);
            interessados.save(marina);
        };
    }
}
