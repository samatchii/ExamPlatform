package com.examplatform.controller;

import com.examplatform.model.Subject;
import com.examplatform.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST gérant les matières (subjects).
 * Permet d'effectuer des opérations CRUD sur les matières
 * proposées dans la plateforme d'examens.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    @Autowired
    SubjectRepository subjectRepository;

    /**
     * Récupère la liste de toutes les matières.
     *
     * @return liste des matières
     */
    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    /**
     * Crée une nouvelle matière.
     *
     * @param subject les données de la matière à créer
     * @return la matière créée
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }

    /**
     * Met à jour une matière existante.
     *
     * @param id             identifiant MongoDB de la matière
     * @param subjectDetails les nouvelles données de la matière
     * @return la matière mise à jour ou 404 si elle n'existe pas
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Subject> updateSubject(@PathVariable String id, @RequestBody Subject subjectDetails) {
        return subjectRepository.findById(id)
                .map(subject -> {
                    subject.setName(subjectDetails.getName());
                    subject.setCode(subjectDetails.getCode());
                    subject.setDescription(subjectDetails.getDescription());
                    subject.setDepartment(subjectDetails.getDepartment());
                    subject.setCredits(subjectDetails.getCredits());
                    return ResponseEntity.ok(subjectRepository.save(subject));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Supprime une matière de la base de données.
     *
     * @param id identifiant MongoDB de la matière
     * @return réponse HTTP 200 en cas de succès ou 404 si elle n'existe pas
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubject(@PathVariable String id) {
        return subjectRepository.findById(id)
                .map(subject -> {
                    subjectRepository.delete(subject);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
