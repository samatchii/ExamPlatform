package com.examplatform.security;

import com.examplatform.model.User;
import com.examplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Implémentation de {@link UserDetailsService} pour Spring Security.
 * Charge les détails d'un utilisateur à partir de son email et construit
 * un objet {@link UserDetails} avec son rôle et son statut de validation.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    /**
     * Charge un utilisateur par son email et construit un {@link UserDetails}
     * avec les informations de rôle et de validation.
     * Les professeurs non validés par l'administration sont désactivés.
     *
     * @param email l'adresse email de l'utilisateur
     * @return l'objet UserDetails pour Spring Security
     * @throws UsernameNotFoundException si aucun utilisateur n'est trouvé
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));

        // Determine if the account is enabled:
        // - ADMIN and STUDENT: always enabled (validated by default, even if field is null)
        // - PROFESSOR: only enabled if explicitly validated by admin
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT";
        boolean isEnabled;
        if ("PROFESSOR".equals(role)) {
            isEnabled = Boolean.TRUE.equals(user.getValidated());
        } else {
            // ADMIN and STUDENT are always active
            isEnabled = true;
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                isEnabled,
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }
}
