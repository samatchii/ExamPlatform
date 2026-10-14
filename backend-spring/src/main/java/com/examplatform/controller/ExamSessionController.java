package com.examplatform.controller;

import com.examplatform.model.Exam;
import com.examplatform.model.ExamSession;
import com.examplatform.model.Result;
import com.examplatform.model.User;
import com.examplatform.repository.ExamRepository;
import com.examplatform.repository.ExamSessionRepository;
import com.examplatform.repository.ResultRepository;
import com.examplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST gérant les sessions d'examen pour les étudiants.
 * Permet de démarrer une session, d'enregistrer les réponses,
 * de signaler des violations et de terminer une session.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/exam-sessions")
public class ExamSessionController {

    @Autowired
    private ExamSessionRepository examSessionRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResultRepository resultRepository;

    /**
     * Récupère l'utilisateur actuellement authentifié à partir du contexte de sécurité.
     *
     * @return l'utilisateur connecté, ou null si non authentifié
     */
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Démarre une nouvelle session d'examen pour l'étudiant connecté.
     * Vérifie la validation du compte, l'existence de l'examen,
     * les résultats précédents (rattrapage possible) et termine
     * automatiquement toute session active précédente.
     *
     * @param body carte contenant l'identifiant de l'examen ("examId")
     * @return la session créée ou une erreur (401, 403, 400)
     */
    @PostMapping("/start")
    public ResponseEntity<?> startSession(@RequestBody Map<String, String> body) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        if (!"Validé".equals(user.getStatus()) && !"ACCEPTE".equals(user.getStatus()))
            return ResponseEntity.status(403).body(Map.of("error", "Compte non validé"));

        String examId = body.get("examId");
        if (examId == null) return ResponseEntity.badRequest().body(Map.of("error", "examId requis"));

        Exam exam = examRepository.findById(examId).orElse(null);
        if (exam == null) return ResponseEntity.badRequest().body(Map.of("error", "Examen introuvable"));

        // Check existing results for this exam
        List<Result> existingResults = resultRepository.findByExamIdAndUserId(examId, user.getId());
        if (!existingResults.isEmpty()) {
            boolean hasPending = existingResults.stream().anyMatch(r -> "PENDING_REVIEW".equals(r.getStatus()));
            boolean hasPassed = existingResults.stream().anyMatch(r -> "GRADED".equals(r.getStatus()) && Boolean.TRUE.equals(r.getGradedPassed()));
            boolean canRetake = existingResults.stream().anyMatch(r -> "GRADED".equals(r.getStatus()) && Boolean.FALSE.equals(r.getGradedPassed()) && Boolean.TRUE.equals(r.getRetakeAvailable()));

            if (hasPending) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vous avez déjà passé cet examen. En attente de la décision du professeur."));
            }
            if (hasPassed) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vous avez déjà validé cet examen. Vous ne pouvez pas le repasser."));
            }
            if (!canRetake) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vous ne pouvez pas repasser cet examen."));
            }
        }

        // Check if already has an active session for this exam
        var existing = examSessionRepository.findByStudentIdAndExamIdAndStatus(user.getId(), examId, "EN_COURS");
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        // Auto-terminate stale active sessions from other exams
        var anyActive = examSessionRepository.findTopByStudentIdAndStatusOrderByStartTimeDesc(user.getId(), "EN_COURS");
        if (anyActive.isPresent()) {
            ExamSession stale = anyActive.get();
            stale.setStatus("TERMINE");
            stale.setEndTime(LocalDateTime.now());
            examSessionRepository.save(stale);
        }

        ExamSession session = new ExamSession();
        session.setStudentId(user.getId());
        session.setExamId(examId);
        session.setStartTime(LocalDateTime.now());
        session.setViolations(0);
        session.setStatus("EN_COURS");

        ExamSession saved = examSessionRepository.save(session);
        return ResponseEntity.ok(saved);
    }

    /**
     * Récupère les informations d'une session d'examen par son identifiant.
     * Calcule le temps restant et termine automatiquement la session
     * si le temps est écoulé.
     *
     * @param id identifiant MongoDB de la session
     * @return les détails de la session (statut, violations, réponses, temps restant)
     *         ou une erreur 401/403/404
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSession(@PathVariable String id) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        return examSessionRepository.findById(id).map(session -> {
            if (!session.getStudentId().equals(user.getId())) {
                return ResponseEntity.<Map<String, Object>>status(403).body(Map.of("error", "Accès refusé"));
            }
            Exam exam = examRepository.findById(session.getExamId()).orElse(null);
            long elapsed = session.getStartTime() != null
                ? ChronoUnit.SECONDS.between(session.getStartTime(), LocalDateTime.now())
                : 0;
            int duration = exam != null ? (exam.getDuration() != null ? exam.getDuration() * 60 : 3600) : 3600;
            long remaining = Math.max(0, duration - elapsed);
            boolean expired = remaining <= 0;

            // Auto-terminate if expired
            if (expired && "EN_COURS".equals(session.getStatus())) {
                session.setStatus("TERMINE");
                session.setEndTime(LocalDateTime.now());
                examSessionRepository.save(session);
            }

            return ResponseEntity.ok(Map.of(
                "id", session.getId(),
                "status", session.getStatus(),
                "violations", session.getViolations(),
                "remaining", remaining,
                "expired", expired,
                "answers", session.getAnswers(),
                "textAnswers", session.getTextAnswers()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Signale une violation de l'étudiant pendant l'examen (changement d'onglet, etc.).
     * La session est immédiatement terminée et la violation est enregistrée
     * dans l'historique.
     *
     * @param id   identifiant MongoDB de la session
     * @param body carte facultative contenant le type de violation
     * @return l'état mis à jour de la session
     */
    @PostMapping("/{id}/violation")
    public ResponseEntity<?> reportViolation(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        return examSessionRepository.findById(id).map(session -> {
            if (!session.getStudentId().equals(user.getId())) {
                return ResponseEntity.<Map<String, Object>>status(403).body(Map.of("error", "Accès refusé"));
            }
            if (!"EN_COURS".equals(session.getStatus())) {
                return ResponseEntity.ok(Map.of("status", session.getStatus(), "terminated", true));
            }

            // Terminate immediately on any violation
            session.setStatus("TERMINE");
            session.setEndTime(LocalDateTime.now());
            session.setViolations((session.getViolations() != null ? session.getViolations() : 0) + 1);

            // Record violation details
            String type = body != null ? (String) body.getOrDefault("type", "inconnu") : "inconnu";
            ExamSession.ViolationRecord record = new ExamSession.ViolationRecord(
                type,
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            );
            if (session.getViolationHistory() == null) {
                session.setViolationHistory(new java.util.ArrayList<>());
            }
            session.getViolationHistory().add(record);

            examSessionRepository.save(session);
            return ResponseEntity.ok(Map.of(
                "status", session.getStatus(),
                "violations", session.getViolations(),
                "violationHistory", session.getViolationHistory(),
                "terminated", true
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Sauvegarde les réponses de l'étudiant en cours d'examen
     * sans terminer la session.
     *
     * @param id   identifiant MongoDB de la session
     * @param body carte contenant les listes "answers" (QCM) et/ou "textAnswers" (questions ouvertes)
     * @return confirmation de sauvegarde ou erreur
     */
    @PostMapping("/{id}/save")
    public ResponseEntity<?> saveAnswers(@PathVariable String id, @RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        return examSessionRepository.findById(id).map(session -> {
            if (!session.getStudentId().equals(user.getId())) {
                return ResponseEntity.<Map<String, Object>>status(403).body(Map.of("error", "Accès refusé"));
            }
            if (!"EN_COURS".equals(session.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Session terminée"));
            }

            if (body.containsKey("answers")) {
                @SuppressWarnings("unchecked")
                List<Integer> ans = (List<Integer>) body.get("answers");
                session.setAnswers(ans);
            }
            if (body.containsKey("textAnswers")) {
                @SuppressWarnings("unchecked")
                List<String> txtAns = (List<String>) body.get("textAnswers");
                session.setTextAnswers(txtAns);
            }

            examSessionRepository.save(session);
            return ResponseEntity.ok(Map.of("saved", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Termine une session d'examen et enregistre les réponses finales
     * de l'étudiant. Si la session est déjà terminée, retourne simplement
     * le statut "TERMINE".
     *
     * @param id   identifiant MongoDB de la session
     * @param body carte contenant les listes "answers" et/ou "textAnswers"
     * @return confirmation de fin de session
     */
    @PostMapping("/{id}/end")
    public ResponseEntity<?> endSession(@PathVariable String id, @RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        return examSessionRepository.findById(id).map(session -> {
            if (!session.getStudentId().equals(user.getId())) {
                return ResponseEntity.<Map<String, Object>>status(403).body(Map.of("error", "Accès refusé"));
            }
            if (!"EN_COURS".equals(session.getStatus())) {
                return ResponseEntity.ok(Map.of("status", "TERMINE"));
            }

            session.setStatus("TERMINE");
            session.setEndTime(LocalDateTime.now());

            if (body.containsKey("answers")) {
                @SuppressWarnings("unchecked")
                List<Integer> ans = (List<Integer>) body.get("answers");
                session.setAnswers(ans);
            }
            if (body.containsKey("textAnswers")) {
                @SuppressWarnings("unchecked")
                List<String> txtAns = (List<String>) body.get("textAnswers");
                session.setTextAnswers(txtAns);
            }

            examSessionRepository.save(session);
            return ResponseEntity.ok(Map.of("status", "TERMINE"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
