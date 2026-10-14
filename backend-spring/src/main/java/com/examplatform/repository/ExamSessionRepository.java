package com.examplatform.repository;

import com.examplatform.model.ExamSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/**
 * Interface repository MongoDB pour l'entité {@link ExamSession}.
 * Fournit des méthodes de recherche spécifiques pour les sessions
 * d'examen par étudiant, examen et statut.
 */
public interface ExamSessionRepository extends MongoRepository<ExamSession, String> {
    /**
     * Recherche une session par étudiant, examen et statut.
     *
     * @param studentId identifiant de l'étudiant
     * @param examId    identifiant de l'examen
     * @param status    statut de la session
     * @return la session trouvée, ou vide si aucune
     */
    Optional<ExamSession> findByStudentIdAndExamIdAndStatus(String studentId, String examId, String status);

    /**
     * Recherche la session la plus récente d'un étudiant avec un statut donné.
     *
     * @param studentId identifiant de l'étudiant
     * @param status    statut de la session
     * @return la session la plus récente, ou vide si aucune
     */
    Optional<ExamSession> findTopByStudentIdAndStatusOrderByStartTimeDesc(String studentId, String status);

    /**
     * Recherche toutes les sessions d'un étudiant pour un examen donné.
     *
     * @param studentId identifiant de l'étudiant
     * @param examId    identifiant de l'examen
     * @return liste des sessions correspondantes
     */
    List<ExamSession> findByStudentIdAndExamId(String studentId, String examId);
}
