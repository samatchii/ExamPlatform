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
 * Entité MongoDB représentant le résultat d'un étudiant à un examen.
 * Stocke le score, les réponses, les corrections, le statut
 * (en attente de révision, noté), le commentaire du professeur,
 * ainsi que les informations sur le rattrapage et la triche.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "results")
public class Result {
    @Id
    private String id;
    private String examId;
    private String userId;
    private Integer score;
    private Boolean passed;
    private List<Integer> answers;
    private List<Integer> correctAnswers;
    private List<String> textAnswers;
    private String status = "PENDING_REVIEW";
    private String teacherComment;
    private Integer grade;
    private Boolean gradedPassed;
    private String gradedBy;
    private Integer attemptNumber = 1;
    private Boolean isRetake = false;
    private Boolean retakeAvailable = false;
    private Boolean flaggedForCheating = false;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime date = LocalDateTime.now();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime gradedAt;
}
