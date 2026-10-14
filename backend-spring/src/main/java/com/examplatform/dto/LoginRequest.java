package com.examplatform.dto;

import lombok.Data;

/**
 * DTO représentant une requête de connexion (login).
 * Contient les identifiants nécessaires à l'authentification.
 */
@Data
public class LoginRequest {
    private String email;
    private String password;
}
