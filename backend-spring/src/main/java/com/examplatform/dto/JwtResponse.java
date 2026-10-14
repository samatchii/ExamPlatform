package com.examplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO représentant la réponse d'authentification après une connexion réussie.
 * Contient le token JWT et les informations publiques de l'utilisateur.
 */
@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private UserResponse user;

    /**
     * DTO interne représentant les informations publiques de l'utilisateur
     * renvoyées après une authentification réussie.
     */
    @Data
    @AllArgsConstructor
    public static class UserResponse {
        private String id;
        private String name;
        private String email;
        private String role;
        private String avatar;
        private Boolean validated;
        private String status;
    }
}
