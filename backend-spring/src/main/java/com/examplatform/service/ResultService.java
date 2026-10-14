package com.examplatform.service;

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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service métier pour la gestion des résultats d'examens.
 * Contient toute la logique : soumission, notation, détection de fraude,
 * gestion des rattrapages, et construction des réponses enrichies.
 */
@Service
public class ResultService {

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamSessionRepository examSessionRepository;

    // ════════════════════════════════════════════════════════════════
    //  Récupération d'un résultat par son ID (avec détection fraude)
    // ════════════════════════════════════════════════════════════════

    /**
     * Cherche un résultat par ID et construit la réponse enrichie.
     * Retourne null si introuvable (le controller gère le 404).
     */
    public Map<String, Object> getResultById(String id) {
        return resultRepository.findById(id)
                .map(this::buildResultDetail)
                .orElse(null);
    }

    /**
     * Enrichit un résultat avec :
     * - Détection rétroactive de fraude (pour les anciens résultats
     *   dont le champ flaggedForCheating est null)
     * - Vérification si un rattrapage a déjà été effectué
     *   (retakeAlreadyTaken), pour cacher le bouton "Passer le rattrapage"
     *   côté frontend.
     */
    public Map<String, Object> buildResultDetail(Result r) {
        // Détection auto de fraude pour les vieux résultats sans le champ
        if (r.getFlaggedForCheating() == null) {
            List<ExamSession> sessions = examSessionRepository.findByStudentIdAndExamId(r.getUserId(), r.getExamId());
            boolean hasViolations = sessions.stream().anyMatch(s -> s.getViolations() != null && s.getViolations() > 0);
            if (hasViolations) {
                r.setFlaggedForCheating(true);
                resultRepository.save(r);
            }
        }
        // Vérifie si un rattrapage a déjà été tenté pour cet examen
        boolean retakeAlreadyTaken = false;
        if (r.getUserId() != null && r.getExamId() != null) {
            retakeAlreadyTaken = resultRepository.findByExamIdAndUserIdOrderByDateDesc(r.getExamId(), r.getUserId())
                    .stream().anyMatch(x -> Boolean.TRUE.equals(x.getIsRetake()));
        }
        Map<String, Object> map = toResultMap(r);
        map.put("retakeAlreadyTaken", retakeAlreadyTaken);
        return map;
    }

    // ════════════════════════════════════════════════════════════════
    //  Soumission d'un résultat (flux principal étudiant)
    // ════════════════════════════════════════════════════════════════

    /**
     * Traite la soumission d'un résultat d'examen par un étudiant.
     *
     * Logique :
     * 1. Associe l'utilisateur connecté si userId est absent
     * 2. Vérifie les doublons (déjà soumis ?)
     * 3. Détecte si c'est une tentative de rattrapage
     *    (basé sur exam.hasRetake ou retakeAvailable)
     * 4. Applique le statut selon le type d'examen et la fraude :
     *    - QCM → auto-évalué (GRADED), sauf fraude → auto-fail
     *    - Contrôle → PENDING_REVIEW (notation manuelle),
     *      sauf fraude QCM (auto-fail) ou fraude contrôle (PENDING_REVIEW)
     *    - Rattrapage avec fraude → auto-fail définitif
     */
    public ResponseEntity<?> submitResult(Result result, Authentication auth) {
        // Récupère l'utilisateur depuis le token JWT
        if (auth != null) {
            String email = auth.getName();
            userRepository.findByEmail(email).ifPresent(u -> {
                if (result.getUserId() == null) result.setUserId(u.getId());
            });
        }

        String examId = result.getExamId();
        String userId = result.getUserId();
        if (examId == null || userId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "examId et userId requis"));
        }

        // Vérification anti-doublon
        List<Result> existing = resultRepository.findByExamIdAndUserIdOrderByDateDesc(examId, userId);
        boolean canRetake = existing.stream().anyMatch(r ->
            "GRADED".equals(r.getStatus()) && Boolean.FALSE.equals(r.getGradedPassed()) && Boolean.TRUE.equals(r.getRetakeAvailable())
        );
        boolean alreadySubmitted = existing.stream().anyMatch(r ->
            "PENDING_REVIEW".equals(r.getStatus()) || ("GRADED".equals(r.getStatus()) && !canRetake)
        );
        if (alreadySubmitted) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vous avez déjà soumis cet examen."));
        }

        Exam exam = examRepository.findById(examId).orElse(null);
        if (exam == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Examen introuvable"));
        }

        // Détection rattrapage : si l'examen le permet ou retakeAvailable
        boolean isRetakeAttempt = false;
        if (Boolean.TRUE.equals(exam.getHasRetake()) || canRetake) {
            if (!existing.isEmpty()) {
                Result latest = existing.get(0);
                result.setAttemptNumber((latest.getAttemptNumber() != null ? latest.getAttemptNumber() : 0) + 1);
                result.setIsRetake(true);
                result.setRetakeAvailable(false); // une seule tentative de rattrapage
                isRetakeAttempt = true;
            }
        }

        // Détermine le statut final selon fraude et type d'examen
        boolean flagged = result.getFlaggedForCheating() != null && result.getFlaggedForCheating();
        if (flagged && isRetakeAttempt) {
            // Fraude pendant un rattrapage → auto-fail définitif
            result.setStatus("GRADED");
            result.setGrade(0);
            result.setGradedPassed(false);
            result.setRetakeAvailable(false);
            result.setGradedAt(LocalDateTime.now());
            result.setTeacherComment("Fraude détectée pendant le rattrapage — module non validé.");
        } else if (flagged && "QCM".equals(exam.getType())) {
            // Fraude en QCM → auto-fail immédiat (pas d'attente professeur)
            result.setStatus("GRADED");
            result.setGrade(0);
            result.setGradedPassed(false);
            result.setGradedAt(LocalDateTime.now());
            result.setTeacherComment("Fraude détectée — examen non validé.");
        } else if (flagged) {
            // Fraude en Contrôle → le professeur décide (PENDING_REVIEW)
            result.setStatus("PENDING_REVIEW");
        } else if ("QCM".equals(exam.getType())) {
            // QCM sans fraude → auto-correction (score sur 20)
            result.setStatus("GRADED");
            result.setGrade(result.getScore() != null ? (int) Math.round(result.getScore() / 5.0) : 0);
            result.setGradedPassed(result.getPassed());
            result.setGradedAt(LocalDateTime.now());
        } else {
            // Contrôle sans fraude → en attente de correction manuelle
            result.setStatus("PENDING_REVIEW");
        }

        return ResponseEntity.ok(resultRepository.save(result));
    }

    // ════════════════════════════════════════════════════════════════
    //  Notation d'un résultat par le professeur
    // ════════════════════════════════════════════════════════════════

    /**
     * Permet à un professeur/admin de noter un résultat.
     * Valide que la note est entre 0 et 20.
     * Met à jour : grade, gradedPassed, retakeAvailable, teacherComment.
     */
    public ResponseEntity<?> gradeResult(String id, Map<String, Object> body, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        return resultRepository.findById(id).map(r -> {
            if (r.getExamId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Résultat sans examen associé"));
            }
            Exam exam = examRepository.findById(r.getExamId()).orElse(null);
            if (exam == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Examen introuvable"));
            }

            // Vérification des droits : admin ou professeur seulement
            boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean isAnyTeacher = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER") || a.getAuthority().equals("ROLE_PROFESSOR"));
            if (!isAdmin && !isAnyTeacher) {
                return ResponseEntity.status(403).body(Map.of("error", "Seul le professeur responsable peut noter"));
            }

            r.setStatus("GRADED");
            if (body.containsKey("grade")) {
                Integer grade = ((Number) body.get("grade")).intValue();
                if (grade < 0 || grade > 20) {
                    return ResponseEntity.badRequest().body(Map.of("error", "La note doit être entre 0 et 20"));
                }
                r.setGrade(grade);
                r.setGradedBy(user != null ? user.getId() : null);
                r.setGradedAt(LocalDateTime.now());
            }
            if (body.containsKey("passed")) {
                r.setGradedPassed((Boolean) body.get("passed"));
            }
            if (body.containsKey("retakeAvailable")) {
                r.setRetakeAvailable((Boolean) body.get("retakeAvailable"));
            }
            if (body.containsKey("teacherComment")) {
                r.setTeacherComment((String) body.get("teacherComment"));
            }
            return ResponseEntity.ok(resultRepository.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ════════════════════════════════════════════════════════════════
    //  Résultats d'un étudiant (pour son tableau de bord)
    // ════════════════════════════════════════════════════════════════

    /**
     * Retourne tous les résultats d'un étudiant avec les infos de l'examen.
     * Utilisé par le frontend pour afficher l'historique des tentatives.
     */
    public List<Map<String, Object>> getUserResults(String userId) {
        return resultRepository.findByUserId(userId).stream().map(r -> {
            Map<String, Object> map = toResultMap(r);
            examRepository.findById(r.getExamId()).ifPresent(e -> map.put("exam", e));
            return map;
        }).collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════════
    //  Résultats d'un examen (pour le professeur)
    // ════════════════════════════════════════════════════════════════

    /**
     * Retourne tous les résultats associés à un examen donné.
     * Inclut les noms/emails des étudiants.
     * Utilisé par le professeur pour la gestion des statuts.
     */
    public List<Map<String, Object>> getExamResults(String examId) {
        return resultRepository.findByExamId(examId).stream().map(r -> {
            Map<String, Object> map = toResultMap(r);
            userRepository.findById(r.getUserId()).ifPresent(u -> {
                map.put("userName", u.getName());
                map.put("userEmail", u.getEmail());
            });
            return map;
        }).collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════════
    //  Résultats en attente (PENDING_REVIEW)
    // ════════════════════════════════════════════════════════════════

    /**
     * Retourne tous les résultats en attente de correction.
     * Inclut les infos étudiant et examen.
     * Les professeurs voient tous les résultats en attente (plus de filtre
     * par teacherId).
     */
    public List<Map<String, Object>> getPendingResults() {
        return resultRepository.findAll().stream()
                .filter(r -> "PENDING_REVIEW".equals(r.getStatus()))
                .map(r -> {
                    Map<String, Object> map = toResultMap(r);
                    if (r.getUserId() != null) {
                        userRepository.findById(r.getUserId()).ifPresent(u -> {
                            map.put("student", Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail(), "avatar", u.getAvatar()));
                        });
                    }
                    if (r.getExamId() != null) {
                        examRepository.findById(r.getExamId()).ifPresent(e -> {
                            map.put("exam", Map.of("id", e.getId(), "title", e.getTitle(), "subject", e.getSubject(), "type", e.getType()));
                        });
                    }
                    return map;
                })
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════════
    //  Tous les résultats (administration)
    // ════════════════════════════════════════════════════════════════

    /**
     * Retourne tous les résultats du système avec les infos utilisateur
     * et examen. Accessible aux admins et professeurs.
     * Utilisé par la page "Tous les résultats".
     */
    public List<Map<String, Object>> getAllResults() {
        return resultRepository.findAll().stream()
                .filter(r -> {
                    return true; // Tous les résultats sont visibles (plus de filtre)
                })
                .map(r -> {
                    Map<String, Object> map = toResultMap(r);
                    if (r.getUserId() != null) {
                        userRepository.findById(r.getUserId()).ifPresent(u -> {
                            map.put("user", Map.of(
                                    "id", u.getId(),
                                    "name", u.getName(),
                                    "email", u.getEmail(),
                                    "avatar", u.getAvatar()
                            ));
                        });
                    }
                    if (r.getExamId() != null) {
                        examRepository.findById(r.getExamId()).ifPresent(e -> {
                            map.put("exam", Map.of(
                                    "id", e.getId(),
                                    "title", e.getTitle(),
                                    "passingScore", e.getPassingScore(),
                                    "hasRetake", e.getHasRetake(),
                                    "type", e.getType()
                            ));
                        });
                    }
                    return map;
                })
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════════
    //  Suppression d'un résultat
    // ════════════════════════════════════════════════════════════════

    /**
     * Supprime un résultat si l'utilisateur a les droits :
     * - Admin et professeurs peuvent tout supprimer
     * - Les étudiants ne peuvent supprimer que leurs propres résultats
     */
    public ResponseEntity<?> deleteResult(String id, Authentication auth) {
        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isTeacher = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER") || a.getAuthority().equals("ROLE_PROFESSOR"));

        return resultRepository.findById(id).map(r -> {
            if (!isAdmin && !isTeacher && (currentUser == null || !currentUser.getId().equals(r.getUserId()))) {
                return ResponseEntity.<Map<String, Object>>status(403).body(Map.of("error", "Accès refusé"));
            }
            resultRepository.delete(r);
            return ResponseEntity.ok().body(Map.of("success", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ════════════════════════════════════════════════════════════════
    //  Mise à jour partielle d'un résultat
    // ════════════════════════════════════════════════════════════════

    /**
     * Met à jour les champs score, teacherComment ou userId d'un résultat.
     * Si score est modifié, recalcule automatiquement passed
     * en fonction du passingScore de l'examen.
     */
    public Result updateResult(String id, Map<String, Object> body) {
        return resultRepository.findById(id).map(r -> {
            if (body.containsKey("score")) {
                Integer score = ((Number) body.get("score")).intValue();
                r.setScore(score);
                examRepository.findById(r.getExamId()).ifPresent(e -> {
                    r.setPassed(score >= e.getPassingScore());
                });
            }
            if (body.containsKey("teacherComment")) {
                r.setTeacherComment((String) body.get("teacherComment"));
            }
            if (body.containsKey("userId")) {
                r.setUserId((String) body.get("userId"));
            }
            return resultRepository.save(r);
        }).orElse(null);
    }

    // ════════════════════════════════════════════════════════════════
    //  Helper : construit la Map commune pour un Result
    // ════════════════════════════════════════════════════════════════

    /**
     * Convertit un objet Result en Map<String, Object> pour la sérialisation JSON.
     * Inclut tous les champs métier : score, statut, notes, fraude, etc.
     * Contient à la fois "id" et "_id" pour la compatibilité MongoDB/frontend.
     */
    private Map<String, Object> toResultMap(Result r) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("_id", r.getId());
        map.put("examId", r.getExamId());
        map.put("userId", r.getUserId());
        map.put("score", r.getScore());
        map.put("passed", r.getPassed());
        map.put("date", r.getDate());
        map.put("gradedAt", r.getGradedAt());
        map.put("teacherComment", r.getTeacherComment());
        map.put("grade", r.getGrade());
        map.put("gradedPassed", r.getGradedPassed());
        map.put("status", r.getStatus());
        map.put("gradedBy", r.getGradedBy());
        map.put("attemptNumber", r.getAttemptNumber());
        map.put("isRetake", r.getIsRetake());
        map.put("retakeAvailable", r.getRetakeAvailable());
        map.put("answers", r.getAnswers());
        map.put("correctAnswers", r.getCorrectAnswers());
        map.put("textAnswers", r.getTextAnswers());
        map.put("flaggedForCheating", r.getFlaggedForCheating());
        return map;
    }
}
