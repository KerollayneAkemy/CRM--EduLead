package com.edulead.security;

import com.edulead.exception.ApiException;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    private final JwtService jwtService;

    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Libera a requisição de pré-validação feita pelo navegador antes de chamadas com JWT.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        // Login é a única rota de API pública; todas as demais exigem um JWT válido.
        if (request.getRequestURI().startsWith("/api/auth/login")) {
            return true;
        }

        // O React envia o token no formato: Authorization: Bearer <token>.
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw ApiException.unauthorized("Token não fornecido ou inválido");
        }

        String token = authHeader.substring(7);
        Claims claims;
        try {
            claims = jwtService.validateToken(token);
        } catch (Exception e) {
            throw ApiException.unauthorized("Token inválido ou expirado");
        }

        // Disponibiliza os dados do token para controllers como PerfilController.
        request.setAttribute("userId", claims.getSubject());
        request.setAttribute("userRole", claims.get("role"));

        RequiresRole requiresRole = handlerMethod.getMethodAnnotation(RequiresRole.class);
        if (requiresRole == null) {
            requiresRole = handlerMethod.getBeanType().getAnnotation(RequiresRole.class);
        }

        if (requiresRole != null) {
            String role = (String) claims.get("role");
            // GESTORA permanece aceito apenas para tokens antigos já emitidos.
            if (!requiresRole.value().equals(role) && !"GESTOR".equals(role) && !"GESTORA".equals(role)) {
                throw ApiException.forbidden("Acesso negado");
            }
        }

        return true;
    }
}
