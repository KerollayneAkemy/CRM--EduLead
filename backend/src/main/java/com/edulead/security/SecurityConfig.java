package com.edulead.security;

import java.util.Arrays;
import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final List<String> allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${edulead.cors.allowed-origin}") String allowedOrigins) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.allowedOrigins = parseAllowedOrigins(allowedOrigins);
    }

    @Bean
    UserDetailsService userDetailsService() {
        // A autenticação do EduLead é exclusivamente por JWT; isto evita a criação
        // automática de uma conta/senha em memória pelo Spring Boot.
        return username -> {
            throw new UsernameNotFoundException("Autenticação por usuário e senha não está habilitada");
        };
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) -> {
                            writeError(response, HttpStatus.UNAUTHORIZED, "Unauthorized", "Autenticação necessária");
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            writeError(response, HttpStatus.FORBIDDEN, "Forbidden", "Acesso negado");
                        }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/login", "/error").permitAll()
                        .requestMatchers("/api/usuarios/**").hasRole("GESTOR")
                        .requestMatchers(HttpMethod.POST, "/api/cursos/**").hasRole("GESTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/**").hasRole("GESTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/cursos/**").hasRole("GESTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/interessados/**").hasRole("GESTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/tarefas/**").hasRole("GESTOR")
                        .requestMatchers("/api/**").authenticated()
                        // Rotas novas não podem se tornar públicas por acidente.
                        .anyRequest().denyAll())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Authorization"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    private List<String> parseAllowedOrigins(String origins) {
        List<String> parsed = Arrays.stream((origins == null ? "" : origins).split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .distinct()
                .toList();
        if (parsed.isEmpty() || parsed.stream().anyMatch(origin -> origin.contains("*"))) {
            throw new IllegalStateException("CORS_ALLOWED_ORIGIN deve conter origens explícitas e nunca curingas");
        }
        return parsed;
    }

    private void writeError(HttpServletResponse response, HttpStatus status, String error, String message)
            throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"status\":" + status.value()
                + ",\"error\":\"" + error + "\",\"message\":\"" + message + "\"}");
    }
}
