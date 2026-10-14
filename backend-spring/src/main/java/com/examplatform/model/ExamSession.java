package com.examplatform.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité MongoDB représentant une session d'examen pour un étudiant.
 * Enregistre l'état de la session (en cours, terminée), les réponses
 * fournies, les violations éventuelles et les horaires de début et fin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "exam_sessions")
public class ExamSession {
    @Id
    private String id;
    private String studentId;
    private String examId;
    private List<Integer> answers;
    private List<String> textAnswers;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime = LocalDateTime.now();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    private Integer violations = 0;
    private List<ViolationRecord> violationHistory = new ArrayList<>();
    private String status = "EN_COURS"; // EN_COURS, TERMINE
    private Integer score;
    private Boolean passed;

    /**
     * Classe interne représentant un enregistrement de violation
     * détectée pendant une session (ex: changement d'onglet).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ViolationRecord {
        private String type;
        private String timestamp;
    }
}
