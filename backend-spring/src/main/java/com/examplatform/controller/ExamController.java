package com.examplatform.controller;

import com.examplatform.model.Exam;
import com.examplatform.model.User;
import com.examplatform.repository.ExamRepository;
import com.examplatform.repository.UserRepository;
import com.examplatform.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Contrôleur REST gérant les opérations CRUD sur les examens.
 * Permet la consultation, la création, la modification, la suppression
 * et l'approbation des examens. Les enseignants et professeurs peuvent
 * créer et gérer leurs propres examens.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/exams")
public class ExamController {
    @Autowired
    ExamRepository examRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ResultRepository resultRepository;

    /**
     * Récupère la liste de tous les examens (sans les questions).
     * Un filtre optionnel permet de n'afficher que les examens en attente.
     *
     * @param status filtre optionnel : "pending" pour les examens non approuvés
     * @return liste des examens filtrés
     */
    @GetMapping
    public List<Exam> getAllExams(@RequestParam(required = false) String status) {
        List<Exam> exams = examRepository.findAllExamsWithoutQuestions();

        if ("pending".equalsIgnoreCase(status)) {
            return exams.stream()
                    .filter(e -> "PENDING".equals(e.getApprovalStatus()))
                    .collect(Collectors.toList());
        }

        return exams.stream()
                .filter(e -> Boolean.TRUE.equals(e.getApprovedByAdmin()) || "APPROVED".equals(e.getApprovalStatus()))
                .collect(Collectors.toList());
    }

    /**
     * Récupère les examens disponibles (approuvés et dont la date
     * est passée ou non définie), triés par date d'examen croissante.
     *
     * @return liste des examens disponibles
     */
    @GetMapping("/available")
    public List<Exam> getAvailableExams() {
        List<Exam> exams = examRepository.findAllExamsWithoutQuestions();
        LocalDateTime now = LocalDateTime.now();

        return exams.stream()
                .filter(e -> Boolean.TRUE.equals(e.getApprovedByAdmin()) || "APPROVED".equals(e.getApprovalStatus()))
                .filter(e -> e.getExamDate() == null || !e.getExamDate().isAfter(now))
                .sorted((a, b) -> {
                    LocalDateTime da = a.getExamDate() != null ? a.getExamDate() : LocalDateTime.MAX;
                    LocalDateTime db = b.getExamDate() != null ? b.getExamDate() : LocalDateTime.MAX;
                    return da.compareTo(db);
                })
                .collect(Collectors.toList());
    }

    /**
     * Récupère les examens à venir (approuvés et dont la date est
     * dans le futur), triés par date d'examen croissante.
     *
     * @return liste des examens à venir
     */
    @GetMapping("/upcoming")
    public List<Exam> getUpcomingExams() {
        List<Exam> exams = examRepository.findAllExamsWithoutQuestions();
        LocalDateTime now = LocalDateTime.now();

        return exams.stream()
                .filter(e -> Boolean.TRUE.equals(e.getApprovedByAdmin()) || "APPROVED".equals(e.getApprovalStatus()))
                .filter(e -> e.getExamDate() != null && e.getExamDate().isAfter(now))
                .sorted((a, b) -> {
                    LocalDateTime da = a.getExamDate() != null ? a.getExamDate() : LocalDateTime.MAX;
                    LocalDateTime db = b.getExamDate() != null ? b.getExamDate() : LocalDateTime.MAX;
                    return da.compareTo(db);
                })
                .collect(Collectors.toList());
    }

    /**
     * Récupère les examens créés par l'enseignant connecté.
     * Accessible par les rôles TEACHER, PROFESSOR et ADMIN.
     *
     * @return liste des examens de l'enseignant
     */
    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER') or hasRole('PROFESSOR') or hasRole('ADMIN')")
    public List<Exam> getTeacherExams() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return List.of();

        List<Exam> exams = examRepository.findAllExamsWithoutQuestions();
        return exams.stream()
                .filter(e -> user.getId().equals(e.getTeacherId()))
                .collect(Collectors.toList());
    }

    /**
     * Récupère un examen par son identifiant, avec toutes ses questions.
     *
     * @param id identifiant MongoDB de l'examen
     * @return l'examen complet ou 404 s'il n'existe pas
     */
    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable String id) {
        return examRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crée un nouvel examen. L'enseignant connecté est automatiquement
     * défini comme créateur. Le type d'examen est normalisé
     * (QCM, Contrôle, Examen final) et le statut d'approbation est "PENDING".
     *
     * @param exam les données de l'examen à créer
     * @return l'examen créé avec ses métadonnées
     */
    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('PROFESSOR') or hasRole('ADMIN')")
    public Exam createExam(@RequestBody Exam exam) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            exam.setTeacherId(user.getId());
            exam.setTeacherName(user.getName());
        }

        if (exam.getType() == null || exam.getType().isBlank()) {
            exam.setType("QCM");
        }

        String type = exam.getType().toUpperCase();
        switch (type) {
            case "CONTRÔLE", "CONTROLE" -> {
                exam.setHasRetake(false);
                exam.setType("Contrôle");
            }
            case "EXAMEN_FINAL", "EXAMEN FINAL", "FINAL" -> {
                exam.setHasRetake(true);
                exam.setType("Examen final");
            }
            default -> {
                exam.setHasRetake(exam.getHasRetake() != null && exam.getHasRetake());
                exam.setType("QCM");
            }
        }

        exam.setCreatedAt(LocalDateTime.now());
        exam.setApprovedByAdmin(false);
        exam.setApprovalStatus("PENDING");
        return examRepository.save(exam);
    }

    /**
     * Approuve un examen. Seul le créateur de l'examen ou un administrateur
     * peut effectuer cette action.
     *
     * @param id identifiant MongoDB de l'examen
     * @return l'examen avec le statut "APPROVED" ou 403/404 en cas d'erreur
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('TEACHER') or hasRole('PROFESSOR') or hasRole('ADMIN')")
    public ResponseEntity<?> approveExam(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return examRepository.findById(id)
                .map(exam -> {
                    boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isOwner = user != null && user.getId().equals(exam.getTeacherId());
                    if (!isAdmin && !isOwner) {
                        return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
                    }
                    exam.setApprovedByAdmin(true);
                    exam.setApprovalStatus("APPROVED");
                    return ResponseEntity.ok(examRepository.save(exam));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Rejette un examen. Seul le créateur de l'examen ou un administrateur
     * peut effectuer cette action.
     *
     * @param id identifiant MongoDB de l'examen
     * @return l'examen avec le statut "REJECTED" ou 403/404 en cas d'erreur
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('TEACHER') or hasRole('PROFESSOR') or hasRole('ADMIN')")
    public ResponseEntity<?> rejectExam(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return examRepository.findById(id)
                .map(exam -> {
                    boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isOwner = user != null && user.getId().equals(exam.getTeacherId());
                    if (!isAdmin && !isOwner) {
                        return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
                    }
                    exam.setApprovedByAdmin(false);
                    exam.setApprovalStatus("REJECTED");
                    return ResponseEntity.ok(examRepository.save(exam));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Met à jour un examen existant (titre, matière, durée, questions, etc.).
     *
     * @param id         identifiant MongoDB de l'examen
     * @param examDetails les nouvelles données de l'examen
     * @return l'examen mis à jour ou 404 s'il n'existe pas
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('PROFESSOR') or hasRole('ADMIN')")
    public ResponseEntity<Exam> updateExam(@PathVariable String id, @RequestBody Exam examDetails) {
        return examRepository.findById(id)
                .map(exam -> {
                    exam.setTitle(examDetails.getTitle());
                    exam.setSubject(examDetails.getSubject());
                    exam.setDuration(examDetails.getDuration());
                    exam.setExamDate(examDetails.getExamDate());
                    exam.setLevel(examDetails.getLevel());
                    exam.setType(examDetails.getType());
                    exam.setTotalQuestions(examDetails.getTotalQuestions());
                    exam.setPassingScore(examDetails.getPassingScore());
                    exam.setDescription(examDetails.getDescription());
                    exam.setTags(examDetails.getTags());
                    exam.setQuestions(examDetails.getQuestions());
                    if (examDetails.getHasRetake() != null) {
                        exam.setHasRetake(examDetails.getHasRetake());
                    }
                    return ResponseEntity.ok(examRepository.save(exam));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Supprime un examen de la base de données.
     *
     * @param id identifiant MongoDB de l'examen
     * @return réponse HTTP 200 en cas de succès ou 404 si l'examen n'existe pas
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('PROFESSOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteExam(@PathVariable String id) {
        return examRepository.findById(id)
                .map(exam -> {
                    examRepository.delete(exam);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
