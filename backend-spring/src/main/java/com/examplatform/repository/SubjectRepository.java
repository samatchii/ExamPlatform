package com.examplatform.repository;

import com.examplatform.model.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Interface repository MongoDB pour l'entité {@link Subject}.
 * Hérite des opérations CRUD standard de MongoRepository.
 */
public interface SubjectRepository extends MongoRepository<Subject, String> {
}
