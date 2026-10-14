package com.examplatform.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité MongoDB représentant un utilisateur de la plateforme.
 * Peut avoir les rôles STUDENT, PROFESSOR ou ADMIN.
 * Contient les informations d'authentification, le statut de validation,
 * l'avatar et la liste des matières associées.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String password;
    private String role;
    private String avatar;
    private Boolean validated = false;
    private String status = "Non validé";
    private List<String> subjects = new ArrayList<>();
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();
}
