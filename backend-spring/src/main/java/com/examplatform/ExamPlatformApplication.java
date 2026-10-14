package com.examplatform;

import com.examplatform.model.Exam;
import com.examplatform.model.User;
import com.examplatform.repository.ExamRepository;
import com.examplatform.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;

/**
 * Classe principale de l'application Spring Boot pour la plateforme d'examens.
 * Au démarrage, initialise les comptes de test (Alice, Admin, Professeur Marie)
 * et crée un jeu d'exemples d'examens si la base est vide.
 */
@SpringBootApplication
public class ExamPlatformApplication {

	/**
	 * Point d'entrée de l'application Spring Boot.
	 *
	 * @param args les arguments de la ligne de commande
	 */
	public static void main(String[] args) {
		SpringApplication.run(ExamPlatformApplication.class, args);
	}

	/**
	 * Initialise les données de démonstration au démarrage :
	 * crée ou met à jour les comptes de test (Alice, Admin, Professeur Marie)
	 * et crée un exemple d'examen si la collection est vide.
	 *
	 * @param userRepository le repository des utilisateurs
	 * @param examRepository le repository des examens
	 * @param encoder        l'encodeur de mots de passe
	 * @return le CommandLineRunner exécuté après le démarrage
	 */
	@Bean
	CommandLineRunner init(UserRepository userRepository, ExamRepository examRepository, PasswordEncoder encoder) {
		return args -> {
			// S'assurer que les comptes de test existent et sont activés/validés
			// Pour alice : toujours mettre à jour le mot de passe BCrypt + validated=true
			userRepository.findByEmail("alice@univ.fr").ifPresentOrElse(
				u -> {
					u.setRole("STUDENT");
					u.setValidated(true);
					u.setStatus("Validé");
					// Re-encode password to ensure BCrypt is used
					u.setPassword(encoder.encode("123456"));
					userRepository.save(u);
				},
				() -> {
					User alice = new User();
					alice.setName("Alice Martin");
					alice.setEmail("alice@univ.fr");
					alice.setPassword(encoder.encode("123456"));
					alice.setRole("STUDENT");
					alice.setAvatar("AM");
					alice.setValidated(true);
					alice.setStatus("Validé");
					userRepository.save(alice);
				}
			);

			userRepository.findByEmail("admin@univ.fr").ifPresentOrElse(
				u -> {
					u.setRole("ADMIN");
					u.setValidated(true);
					u.setStatus("Validé");
					// Re-encode password to ensure BCrypt is used
					u.setPassword(encoder.encode("admin123"));
					userRepository.save(u);
				},
				() -> {
					User admin = new User();
					admin.setName("Admin Prof");
					admin.setEmail("admin@univ.fr");
					admin.setPassword(encoder.encode("admin123"));
					admin.setRole("ADMIN");
					admin.setAvatar("AP");
					admin.setValidated(true);
					admin.setStatus("Validé");
					userRepository.save(admin);
				}
			);

			userRepository.findByEmail("prof@univ.fr").ifPresentOrElse(
				u -> {
					u.setRole("PROFESSOR");
					u.setValidated(true);
					u.setStatus("Validé");
					// Re-encode password to ensure BCrypt is used
					u.setPassword(encoder.encode("prof123"));
					userRepository.save(u);
				},
				() -> {
					User professor = new User();
					professor.setName("Marie Dubois");
					professor.setEmail("prof@univ.fr");
					professor.setPassword(encoder.encode("prof123"));
					professor.setRole("PROFESSOR");
					professor.setAvatar("MD");
					professor.setValidated(true);
					professor.setStatus("Validé");
					userRepository.save(professor);
				}
			);

			// Fix all existing users: ensure validated, role, and password are correct
			userRepository.findAll().forEach(u -> {
				boolean changed = false;
				if (u.getRole() == null || u.getRole().isEmpty()) {
					u.setRole("STUDENT");
					changed = true;
				}
				// Auto-validate all users so they can log in
				if (!Boolean.TRUE.equals(u.getValidated())) {
					u.setValidated(true);
					u.setStatus("Validé");
					changed = true;
				}
				if (u.getStatus() == null) {
					u.setStatus("Validé");
					changed = true;
				}
				// Ensure password is BCrypt-encoded (fix plain-text passwords)
				if (u.getPassword() == null || !u.getPassword().startsWith("$2a$")) {
					u.setPassword(encoder.encode("123456"));
					changed = true;
				}
				if (changed) {
					userRepository.save(u);
				}
			});

			System.out.println("✅ Comptes de test assurés : Alice (étudiant), Admin, Prof Marie");

			if (examRepository.count() == 0) {
				Exam exam1 = new Exam();
				exam1.setTitle("Algorithmique & Structures de Données");
				exam1.setSubject("Informatique");
				exam1.setDuration(60);
				exam1.setLevel("Intermédiaire");
				exam1.setTotalQuestions(5);
				exam1.setPassingScore(60);
				exam1.setDescription("Évaluez vos connaissances en algorithmes de tri, recherche et structures de données fondamentales.");
				exam1.setTags(Arrays.asList("Tri", "Graphes", "Complexité"));
				exam1.setQuestions(Arrays.asList(
						new Exam.Question("Quelle est la complexité temporelle du tri rapide (QuickSort) en moyenne ?", Arrays.asList("O(n)", "O(n log n)", "O(n²)", "O(log n)"), 1),
						new Exam.Question("Quelle structure de données utilise le principe LIFO ?", Arrays.asList("File", "Pile", "Arbre", "Graphe"), 1),
						new Exam.Question("Quel algorithme de recherche nécessite un tableau trié ?", Arrays.asList("Recherche linéaire", "Recherche binaire", "BFS", "DFS"), 1),
						new Exam.Question("Quelle est la complexité spatiale d'un arbre binaire de recherche équilibré ?", Arrays.asList("O(1)", "O(log n)", "O(n)", "O(n²)"), 2),
						new Exam.Question("Quel parcours d'arbre visite : gauche, racine, droite ?", Arrays.asList("Préordre", "Inordre", "Postordre", "BFS"), 1)
				));
				exam1.setApprovedByAdmin(true);
				exam1.setApprovalStatus("APPROVED");
				examRepository.save(exam1);
				System.out.println("Examens initiaux créés");
			}
		};
	}
}
