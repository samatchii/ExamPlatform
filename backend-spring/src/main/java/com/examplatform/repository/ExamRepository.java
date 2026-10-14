package com.examplatform.repository;

import com.examplatform.model.Exam;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

/**
 * Interface repository MongoDB pour l'entité {@link Exam}.
 * Fournit les opérations CRUD standard ainsi qu'une méthode
 * personnalisée pour récupérer les examens sans leurs questions.
 */
public interface ExamRepository extends MongoRepository<Exam, String> {
    /**
     * Récupère tous les examens en excluant le champ {@code questions}
     * pour optimiser le temps de réponse lors des listes.
     *
     * @return liste des examens sans les questions
     */
    @Query(value = "{}", fields = "{ 'questions' : 0 }")
    List<Exam> findAllExamsWithoutQuestions();
}
