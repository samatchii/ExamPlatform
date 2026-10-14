package com.examplatform.controller;

import com.examplatform.model.Result;
import com.examplatform.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour les résultats d'examens.
 * Délègue toute la logique métier à ResultService.
 * Gère uniquement les requêtes/réponses HTTP.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/results")
public class ResultController {

    @Autowired
    private ResultService resultService;

    /**
     * PUT /api/results/{id}/grade
     * Permet à un professeur de noter un résultat (note, décision, commentaire).
     * Corps attendu : { grade, passed, retakeAvailable, teacherComment }
     */
    @PutMapping("/{id}/grade")
    public ResponseEntity<?> gradeResult(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return resultService.gradeResult(id, body, auth);
    }

    /**
     * POST /api/results
     * Soumet un résultat d'examen (appelé après la fin d'une session).
     * Le service détermine le statut : GRADED (QCM) ou PENDING_REVIEW (Contrôle).
     * Gère aussi la détection de fraude et les rattrapages.
     */
    @PostMapping
    public ResponseEntity<?> submitResult(@RequestBody Result result) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return resultService.submitResult(result, auth);
    }

    /**
     * GET /api/results/user/{userId}
     * Retourne tous les résultats d'un étudiant (pour son tableau de bord).
     */
    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getUserResults(@PathVariable String userId) {
        return resultService.getUserResults(userId);
    }

    /**
     * GET /api/results/exam/{examId}
     * Retourne tous les résultats d'un examen spécifique (vue professeur).
     */
    @GetMapping("/exam/{examId}")
    public List<Map<String, Object>> getExamResults(@PathVariable String examId) {
        return resultService.getExamResults(examId);
    }

    /**
     * GET /api/results/pending
     * Retourne les résultats en attente de correction (PENDING_REVIEW).
     * Réservé aux professeurs et admins.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('TEACHER') or hasRole('PROFESSOR') or hasRole('ADMIN')")
    public List<Map<String, Object>> getPendingResults() {
        return resultService.getPendingResults();
    }

    /**
     * GET /api/results/{id}
     * Retourne le détail d'un résultat avec enrichissements :
     * - Détection rétroactive de fraude
     * - Flag retakeAlreadyTaken
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getResultById(@PathVariable String id) {
        Map<String, Object> detail = resultService.getResultById(id);
        if (detail == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(detail);
    }

    /**
     * GET /api/results
     * Retourne tous les résultats du système (administration).
     */
    @GetMapping
    public List<Map<String, Object>> getAllResults() {
        return resultService.getAllResults();
    }

    /**
     * DELETE /api/results/{id}
     * Supprime un résultat (admin/prof ou propriétaire).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResult(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return resultService.deleteResult(id, auth);
    }

    /**
     * PUT /api/results/{id}
     * Mise à jour partielle d'un résultat (score, commentaire, userId).
     */
    @PutMapping("/{id}")
    public ResponseEntity<Result> updateResult(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Result updated = resultService.updateResult(id, body);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }
}
