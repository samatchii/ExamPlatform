package com.examplatform.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

/**
 * Entité MongoDB représentant une matière enseignée.
 * Contient le nom, le code, la description, le département
 * et le nombre de crédits associés.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "subjects")
public class Subject {
    @Id
    private String id;
    private String name;
    private String code;
    private String description;
    private String department;
    private Integer credits;
    private Date createdAt = new Date();
}
