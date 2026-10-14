package com.examplatform.controller;

import com.examplatform.model.ScheduledExam;
import com.examplatform.repository.ScheduledExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Contrôleur REST gérant les examens programmés (planification).
 * Permet de créer, consulter, modifier et supprimer des examens
 * planifiés avec date, salle et durée définies.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/scheduled-exams")
public class ScheduledExamController {
    @Autowired
    ScheduledExamRepository scheduledExamRepository;

    /**
     * Récupère tous les examens programmés.
     *
     * @return liste de tous les examens planifiés
     */
    @GetMapping
    public List<ScheduledExam> getAllScheduledExams() {
        return scheduledExamRepository.findAll();
    }

    /**
     * Récupère les examens programmés dont le statut est "SCHEDULED".
     *
     * @return liste des examens à venir
     */
    @GetMapping("/upcoming")
    public List<ScheduledExam> getUpcomingExams() {
        return scheduledExamRepository.findByStatus("SCHEDULED");
    }

    /**
     * Crée un nouvel examen programmé avec le statut "SCHEDULED".
     *
     * @param scheduledExam les données de l'examen à planifier
     * @return l'examen programmé créé
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ScheduledExam createScheduledExam(@RequestBody ScheduledExam scheduledExam) {
        scheduledExam.setStatus("SCHEDULED");
        scheduledExam.setCreatedAt(LocalDateTime.now());
        return scheduledExamRepository.save(scheduledExam);
    }

    /**
     * Met à jour un examen programmé existant.
     *
     * @param id         identifiant MongoDB de l'examen programmé
     * @param examDetails les nouvelles données
     * @return l'examen programmé mis à jour ou 404 s'il n'existe pas
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ScheduledExam> updateScheduledExam(@PathVariable String id, @RequestBody ScheduledExam examDetails) {
        return scheduledExamRepository.findById(id)
                .map(exam -> {
                    exam.setTitle(examDetails.getTitle());
                    exam.setSubject(examDetails.getSubject());
                    exam.setStartDate(examDetails.getStartDate());
                    exam.setEndDate(examDetails.getEndDate());
                    exam.setDuration(examDetails.getDuration());
                    exam.setRoom(examDetails.getRoom());
                    exam.setStatus(examDetails.getStatus());
                    return ResponseEntity.ok(scheduledExamRepository.save(exam));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Supprime un examen programmé de la base de données.
     *
     * @param id identifiant MongoDB de l'examen programmé
     * @return réponse HTTP 200 en cas de succès ou 404 s'il n'existe pas
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<?> deleteScheduledExam(@PathVariable String id) {
        return scheduledExamRepository.findById(id)
                .map(exam -> {
                    scheduledExamRepository.delete(exam);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
