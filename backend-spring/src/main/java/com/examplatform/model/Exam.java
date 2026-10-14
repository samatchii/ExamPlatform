package com.examplatform.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entité MongoDB représentant un examen.
 * Contient les informations générales (titre, matière, durée, niveau),
 * la liste des questions QCM et questions ouvertes, ainsi que les
 * métadonnées de création et d'approbation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "exams")
public class Exam {
    @Id
    private String id;
    private String title;
    private String subject;
    private Integer duration;
    private String level;
    private Integer totalQuestions;
    private Integer passingScore;
    private String description;
    private List<String> tags;
    private List<Question> questions;
    private List<OpenQuestion> openQuestions;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime examDate;

    private String type = "QCM";
    private Boolean hasRetake = false;
    private String teacherId;
    private String teacherName;
    private Boolean approvedByAdmin = false;
    private String approvalStatus = "PENDING";

    /**
     * Classe interne représentant une question à choix multiples (QCM).
     * Contient le texte de la question, les options possibles
     * et l'indice de la réponse correcte.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String text;
        private List<String> options;
        private Integer correct;
    }

    /**
     * Classe interne représentant une question ouverte.
     * Contient uniquement le texte de la question.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpenQuestion {
        private String text;
    }
}
