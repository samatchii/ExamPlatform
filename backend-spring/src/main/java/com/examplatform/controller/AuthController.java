package com.examplatform.controller;

import com.examplatform.dto.JwtResponse;
import com.examplatform.dto.LoginRequest;
import com.examplatform.dto.RegisterRequest;
import com.examplatform.model.User;
import com.examplatform.repository.UserRepository;
import com.examplatform.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST gérant l'authentification des utilisateurs.
 * Propose les endpoints de connexion (login) et d'inscription (register).
 * Utilise JWT pour la gestion des tokens d'authentification.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    /**
     * Authentifie un utilisateur avec son email et mot de passe.
     * En cas de succès, génère un token JWT et retourne les informations
     * de l'utilisateur avec le token.
     *
     * @param loginRequest les identifiants de connexion (email, mot de passe)
     * @return {@link JwtResponse} contenant le token et les infos utilisateur,
     *         ou une erreur 401 si l'authentification échoue
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(() -> new RuntimeException("Error: User not found"));

            return ResponseEntity.ok(new JwtResponse(jwt,
                    new JwtResponse.UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAvatar(), user.getValidated(), user.getStatus())));
        } catch (org.springframework.security.authentication.DisabledException e) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Votre compte n'est pas encore validé par l'administrateur."));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Email ou mot de passe incorrect."));
        }
    }

    /**
     * Inscrit un nouvel utilisateur sur la plateforme.
     * Gère la création de l'avatar, l'encodage du mot de passe,
     * et la validation automatique selon le rôle (étudiant et admin
     * sont validés immédiatement, les professeurs nécessitent une validation
     * administrative).
     * Si l'utilisateur est validé, un token JWT est généré automatiquement.
     *
     * @param signUpRequest les informations d'inscription (nom, email, mot de passe, rôle)
     * @return {@link JwtResponse} si validation immédiate, ou message d'attente
     *         de validation, ou erreur 400 si l'email est déjà utilisé
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Erreur: Cet email est déjà utilisé!"));
        }

        // Create new user's account
        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(signUpRequest.getRole());

        // Create avatar
        String avatar = "";
        String[] names = signUpRequest.getName().split(" ");
        for (String n : names) {
            if (!n.isEmpty()) avatar += n.substring(0, 1).toUpperCase();
        }
        user.setAvatar(avatar);

        // Gestion des rôles et de la validation
        if ("ADMIN".equalsIgnoreCase(signUpRequest.getRole()) || "admin".equalsIgnoreCase(signUpRequest.getRole())) {
            user.setRole("ADMIN");
            user.setValidated(true);
            user.setStatus("Validé");
        } else if ("PROFESSOR".equalsIgnoreCase(signUpRequest.getRole()) || "teacher".equalsIgnoreCase(signUpRequest.getRole())) {
            user.setRole("PROFESSOR");
            user.setValidated(false);
            user.setStatus("Non validé");
        } else {
            user.setRole("STUDENT");
            user.setValidated(true); // Les étudiants sont validés automatiquement (ou selon votre logique)
            user.setStatus("Validé");
        }

        userRepository.save(user);

        if (Boolean.TRUE.equals(user.getValidated())) {
            // Auto login after register
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signUpRequest.getEmail(), signUpRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            return ResponseEntity.ok(new JwtResponse(jwt,
                    new JwtResponse.UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAvatar(), user.getValidated(), user.getStatus())));
        } else {
            return ResponseEntity.ok(java.util.Map.of(
                "pending", true,
                "message", "Inscription réussie ! Votre compte est en attente de validation par un administrateur."
            ));
        }
    }
}