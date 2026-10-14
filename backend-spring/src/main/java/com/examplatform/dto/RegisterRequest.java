package com.examplatform.dto;

import lombok.Data;

/**
 * DTO représentant une requête d'inscription (register).
 * Contient les informations nécessaires à la création d'un nouveau compte.
 */
@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
}
