package com.examplatform.repository;

import com.examplatform.model.ScheduledExam;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Interface repository MongoDB pour l'entité {@link ScheduledExam}.
 * Fournit une méthode de recherche par statut pour les examens programmés.
 */
public interface ScheduledExamRepository extends MongoRepository<ScheduledExam, String> {
    /**
     * Recherche les examens programmés par statut.
     *
     * @param status le statut recherché (ex: "SCHEDULED")
     * @return liste des examens programmés correspondant au statut
     */
    List<ScheduledExam> findByStatus(String status);
}
