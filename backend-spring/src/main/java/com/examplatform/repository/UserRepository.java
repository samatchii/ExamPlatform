package com.examplatform.repository;

import com.examplatform.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

/**
 * Interface repository MongoDB pour l'entité {@link User}.
 * Fournit une méthode de recherche d'utilisateur par adresse email.
 */
public interface UserRepository extends MongoRepository<User, String> {
    /**
     * Recherche un utilisateur par son adresse email.
     *
     * @param email l'adresse email de l'utilisateur
     * @return l'utilisateur trouvé, ou vide si aucun compte ne correspond
     */
    Optional<User> findByEmail(String email);
}
