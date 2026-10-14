package com.examplatform.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Point d'entrée de l'authentification JWT.
 * Implémente {@link AuthenticationEntryPoint} pour renvoyer
 * une réponse HTTP 401 (Unauthorized) lorsqu'un utilisateur
 * non authentifié tente d'accéder à une ressource protégée.
 */
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    /**
     * Appelé lorsqu'un utilisateur non authentifié accède à une ressource protégée.
     * Logge l'erreur et renvoie une réponse 401.
     *
     * @param request       la requête HTTP
     * @param response      la réponse HTTP
     * @param authException l'exception d'authentification
     * @throws IOException      en cas d'erreur d'entrée/sortie
     * @throws ServletException en cas d'erreur de servlet
     */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        logger.error("Unauthorized error: {}", authException.getMessage());
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
    }
}
