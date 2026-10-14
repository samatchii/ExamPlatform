package com.examplatform.controller;

import com.examplatform.model.User;
import com.examplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Contrôleur REST dédié aux fonctionnalités d'administration.
 * Permet la gestion des utilisateurs (CRUD), la validation des comptes,
 * la modification des statuts et l'obtention de statistiques globales.
 * Tous les endpoints sont réservés aux utilisateurs ayant le rôle ADMIN.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    UserRepository userRepository;

    /**
     * Récupère la liste de tous les utilisateurs avec des filtres optionnels
     * par rôle et par statut de validation.
     *
     * @param role     rôle à filtrer (ex. "STUDENT", "PROFESSOR", "ADMIN")
     * @param validated statut de validation à filtrer (true/false)
     * @return liste d'utilisateurs formatés pour la réponse
     */
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PROFESSOR')")
    public List<Map<String, Object>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean validated) {
        
        List<User> users = userRepository.findAll();
        
        // Filtrer par rôle si spécifié
        if (role != null && !role.isEmpty()) {
            users = users.stream()
                    .filter(u -> u.getRole().equalsIgnoreCase(role))
                    .collect(Collectors.toList());
        }
        
        // Filtrer par statut de validation si spécifié
        if (validated != null) {
            users = users.stream()
                    .filter(u -> validated.equals(u.getValidated()))
                    .collect(Collectors.toList());
        }
        
        return users.stream().map(this::mapUserToResponse).collect(Collectors.toList());
    }

    /**
     * Récupère la liste des utilisateurs dont le compte n'est pas encore validé
     * par un administrateur.
     *
     * @return liste des utilisateurs en attente de validation
     */
    @GetMapping("/users/pending")
    public List<Map<String, Object>> getPendingUsers() {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> !Boolean.TRUE.equals(u.getValidated()))
                .collect(Collectors.toList());
        return users.stream().map(this::mapUserToResponse).collect(Collectors.toList());
    }

    /**
     * Approuve un utilisateur en attente de validation.
     * Passe son statut à "Validé" et active son compte.
     *
     * @param id identifiant MongoDB de l'utilisateur
     * @return réponse HTTP avec l'utilisateur mis à jour ou 404 si introuvable
     */
    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setValidated(true);
                    user.setStatus("Validé");
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                        "message", "Utilisateur approuvé avec succès",
                        "user", mapUserToResponse(user)
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Rejette un utilisateur en attente de validation.
     * Passe son statut à "Non validé" et désactive son compte.
     *
     * @param id   identifiant MongoDB de l'utilisateur
     * @param body corps facultatif contenant d'éventuels motifs de rejet
     * @return réponse HTTP avec l'utilisateur mis à jour ou 404 si introuvable
     */
    @PutMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setValidated(false);
                    user.setStatus("Non validé");
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                        "message", "Utilisateur rejeté",
                        "user", mapUserToResponse(user)
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Supprime définitivement un utilisateur de la base de données.
     *
     * @param id identifiant MongoDB de l'utilisateur
     * @return réponse HTTP 200 avec un message de confirmation ou 404 si introuvable
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Met à jour le statut d'un utilisateur.
     * Accessible par les rôles PROFESSOR et ADMIN.
     * Les statuts valides sont : "Validé", "Non validé", "Absent", "Rattrapage".
     *
     * @param id   identifiant MongoDB de l'utilisateur
     * @param body carte contenant le champ "status" avec la nouvelle valeur
     * @return réponse HTTP avec l'utilisateur mis à jour ou 400/404 en cas d'erreur
     */
    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || !List.of("Validé", "Non validé", "Absent", "Rattrapage").contains(status)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Statut invalide"));
        }
        
        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(status);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                        "message", "Statut mis à jour",
                        "user", mapUserToResponse(user)
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Modifie les informations d'un compte utilisateur (nom, email, rôle, statut, validation, matières).
     * Vérifie l'unicité de l'email avant modification.
     *
     * @param id   identifiant MongoDB de l'utilisateur
     * @param body carte contenant les champs à mettre à jour
     * @return réponse HTTP avec l'utilisateur mis à jour ou 400/404 en cas d'erreur
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return userRepository.findById(id)
                .map(user -> {
                    if (body.containsKey("name")) {
                        user.setName((String) body.get("name"));
                    }
                    if (body.containsKey("email")) {
                        String email = (String) body.get("email");
                        if (!user.getEmail().equalsIgnoreCase(email) && userRepository.findByEmail(email).isPresent()) {
                            return ResponseEntity.badRequest().body(Map.of("message", "Erreur: Cet email est déjà utilisé!"));
                        }
                        user.setEmail(email);
                    }
                    if (body.containsKey("role")) {
                        user.setRole((String) body.get("role"));
                    }
                    if (body.containsKey("validated")) {
                        user.setValidated((Boolean) body.get("validated"));
                    }
                    if (body.containsKey("status")) {
                        user.setStatus((String) body.get("status"));
                    }
                    if (body.containsKey("subjects")) {
                        user.setSubjects((List<String>) body.get("subjects"));
                    }
                    
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                        "message", "Utilisateur mis à jour avec succès",
                        "user", mapUserToResponse(user)
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retourne des statistiques globales sur les utilisateurs :
     * nombre total, nombre par rôle, en attente de validation, etc.
     *
     * @return carte contenant les différentes statistiques
     */
    @GetMapping("/stats")
    public Map<String, Object> getAdminStats() {
        List<User> allUsers = userRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", allUsers.size());
        stats.put("totalStudents", allUsers.stream().filter(u -> "student".equalsIgnoreCase(u.getRole()) || "STUDENT".equalsIgnoreCase(u.getRole())).count());
        stats.put("totalTeachers", allUsers.stream().filter(u -> "teacher".equalsIgnoreCase(u.getRole()) || "PROFESSOR".equalsIgnoreCase(u.getRole())).count());
        stats.put("totalAdmins", allUsers.stream().filter(u -> "admin".equalsIgnoreCase(u.getRole()) || "ADMIN".equalsIgnoreCase(u.getRole())).count());
        stats.put("pendingValidation", allUsers.stream().filter(u -> !Boolean.TRUE.equals(u.getValidated())).count());
        stats.put("validatedUsers", allUsers.stream().filter(u -> Boolean.TRUE.equals(u.getValidated())).count());
        
        return stats;
    }

    /**
     * Méthode utilitaire qui transforme un objet User en une carte de données
     * adaptée à la réponse JSON (sans le mot de passe).
     *
     * @param user l'utilisateur à formater
     * @return carte contenant les champs publics de l'utilisateur
     */
    private Map<String, Object> mapUserToResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("avatar", user.getAvatar());
        response.put("validated", user.getValidated());
        response.put("status", user.getStatus());
        response.put("subjects", user.getSubjects());
        response.put("createdAt", user.getCreatedAt());
        return response;
    }
}
