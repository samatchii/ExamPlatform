package com.examplatform.repository;

import com.examplatform.model.Result;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

/**
 * Interface repository MongoDB pour l'entité {@link Result}.
 * Fournit des méthodes de recherche pour les résultats par utilisateur,
 * examen, rattrapage et ordre chronologique.
 */
public interface ResultRepository extends MongoRepository<Result, String> {
    /**
     * Recherche tous les résultats d'un utilisateur.
     *
     * @param userId identifiant de l'utilisateur
     * @return liste des résultats de l'utilisateur
     */
    List<Result> findByUserId(String userId);

    /**
     * Recherche les résultats d'un utilisateur pour un examen spécifique.
     *
     * @param examId identifiant de l'examen
     * @param userId identifiant de l'utilisateur
     * @return liste des résultats correspondants
     */
    List<Result> findByExamIdAndUserId(String examId, String userId);

    /**
     * Compte le nombre de tentatives d'un utilisateur pour un examen.
     *
     * @param examId identifiant de l'examen
     * @param userId identifiant de l'utilisateur
     * @return nombre de tentatives
     */
    long countByExamIdAndUserId(String examId, String userId);

    /**
     * Recherche les résultats d'un utilisateur pour un examen en filtrant
     * sur le statut de rattrapage.
     *
     * @param examId  identifiant de l'examen
     * @param userId  identifiant de l'utilisateur
     * @param isRetake indique s'il s'agit d'un rattrapage
     * @return liste des résultats correspondants
     */
    List<Result> findByExamIdAndUserIdAndIsRetake(String examId, String userId, Boolean isRetake);

    /**
     * Recherche les résultats d'un utilisateur pour un examen,
     * triés par date décroissante.
     *
     * @param examId identifiant de l'examen
     * @param userId identifiant de l'utilisateur
     * @return liste des résultats triés
     */
    List<Result> findByExamIdAndUserIdOrderByDateDesc(String examId, String userId);

    /**
     * Recherche tous les résultats pour un examen donné.
     *
     * @param examId identifiant de l'examen
     * @return liste des résultats
     */
    List<Result> findByExamId(String examId);

    /**
     * Recherche tous les résultats pour un examen donné, triés par date décroissante.
     *
     * @param examId identifiant de l'examen
     * @return liste des résultats triés
     */
    List<Result> findByExamIdOrderByDateDesc(String examId);
}
