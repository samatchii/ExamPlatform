package com.examplatform.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * Entité MongoDB représentant un examen programmé (planifié).
 * Contient les informations de planification : dates de début et fin,
 * salle, durée, statut et le créateur de la programmation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "scheduled_exams")
public class ScheduledExam {
    @Id
    private String id;
    private String examId;
    private String title;
    private String subject;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;
    
    private Integer duration;
    private String room;
    private String status;
    private String createdBy;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();
}
