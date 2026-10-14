package com.examplatform.controller;

import com.examplatform.repository.ExamRepository;
import com.examplatform.repository.ResultRepository;
import com.examplatform.repository.UserRepository;
import com.examplatform.model.Exam;
import com.examplatform.model.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Contrôleur REST fournissant des données d'analyse et de statistiques
 * pour le tableau de bord. Calcule les tendances d'utilisation
 * (utilisateurs, examens, résultats) et les activités jour/semaine/mois.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    ExamRepository examRepository;

    @Autowired
    ResultRepository resultRepository;

    /**
     * Calcule et retourne les statistiques globales de la plateforme :
     * <ul>
     *   <li>Nombre d'utilisateurs, d'examens approuvés et de résultats</li>
     *   <li>Évolution sur la période (hier, semaine, mois)</li>
     *   <li>Taux de réussite global et évolution</li>
     *   <li>Activité par heure (jour), par jour (semaine) et par mois (12 mois)</li>
     *   <li>Les 5 résultats les plus récents</li>
     * </ul>
     *
     * @return carte complète des statistiques
     */
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);
        LocalDateTime lastWeek = now.minusDays(7);
        LocalDateTime lastMonth = now.minusMonths(1);

        // Users
        long totalUsers = userRepository.count();
        long usersYesterday = userRepository.findAll().stream().filter(u ->
                u.getCreatedAt() != null && u.getCreatedAt().isBefore(yesterday)
        ).count();
        long usersChange = usersYesterday > 0 ? ((totalUsers - usersYesterday) * 100 / usersYesterday) : 0;

        // Exams (only approved)
        List<Exam> allExams = examRepository.findAll().stream()
                .filter(e -> Boolean.TRUE.equals(e.getApprovedByAdmin()) || "APPROVED".equals(e.getApprovalStatus()))
                .collect(java.util.stream.Collectors.toList());
        long totalExams = allExams.size();
        long examsLastWeek = allExams.stream().filter(e ->
                e.getCreatedAt() != null && e.getCreatedAt().isBefore(lastWeek)
        ).count();
        long examsChange = totalExams - examsLastWeek;

        // Results
        List<Result> results = resultRepository.findAll();
        long totalResults = results.size();
        long resultsLastMonth = results.stream().filter(r ->
                r.getDate() != null && r.getDate().isBefore(lastMonth)
        ).count();
        long resultsChange = resultsLastMonth > 0 ? ((totalResults - resultsLastMonth) * 100 / resultsLastMonth) : 0;

        // Pass rate
        long passedResults = results.stream().filter(r -> {
            Boolean gp = r.getGradedPassed();
            if (gp != null) return gp;
            return Boolean.TRUE.equals(r.getPassed());
        }).count();
        int passRate = totalResults > 0 ? (int) Math.round((double) passedResults / totalResults * 100) : 0;

        // Pass rate last month
        List<Result> resultsLastMonthList = results.stream().filter(r ->
                r.getDate() != null && r.getDate().isBefore(lastMonth)
        ).toList();
        long passedLastMonth = resultsLastMonthList.stream().filter(r -> {
            Boolean gp = r.getGradedPassed();
            if (gp != null) return gp;
            return Boolean.TRUE.equals(r.getPassed());
        }).count();
        int passRateLastMonth = resultsLastMonthList.size() > 0 ? (int) Math.round((double) passedLastMonth / resultsLastMonthList.size() * 100) : 0;
        int passRateChange = passRate - passRateLastMonth;

        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", totalUsers);
        response.put("usersChange", usersChange);
        response.put("totalExams", totalExams);
        response.put("examsChange", examsChange);
        response.put("totalResults", totalResults);
        response.put("resultsChange", resultsChange);
        response.put("passRate", passRate);
        response.put("passRateChange", passRateChange);

        // Activity for Day (hours of today, 06h to 22h)
        List<Map<String, Object>> activityDay = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i <= 22; i+=2) {
            final int hour = i;
            long count = results.stream().filter(r -> {
                if (r.getDate() == null) return false;
                LocalDateTime resDate = r.getDate();
                return resDate.toLocalDate().equals(today) && resDate.getHour() >= hour && resDate.getHour() < hour + 2;
            }).count();
            Map<String, Object> map = new HashMap<>();
            map.put("label", String.format("%02dh", hour));
            map.put("amount", count);
            activityDay.add(map);
        }

        // Activity for Week (last 7 days)
        List<Map<String, Object>> activityWeek = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long count = results.stream().filter(r -> {
                if (r.getDate() == null) return false;
                return r.getDate().toLocalDate().equals(date);
            }).count();
            Map<String, Object> dayMap = new HashMap<>();
            String dayLabel = date.getDayOfWeek().name().substring(0, 3);
            dayMap.put("label", dayLabel.substring(0,1).toUpperCase() + dayLabel.substring(1).toLowerCase());
            dayMap.put("amount", count);
            activityWeek.add(dayMap);
        }

        // Activity for Month (last 12 months)
        List<Map<String, Object>> activityMonth = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate date = today.minusMonths(i);
            long count = results.stream().filter(r -> {
                if (r.getDate() == null) return false;
                return r.getDate().getYear() == date.getYear() && r.getDate().getMonth() == date.getMonth();
            }).count();
            Map<String, Object> monthMap = new HashMap<>();
            String monthLabel = date.getMonth().name().substring(0, 3);
            monthMap.put("label", monthLabel.substring(0,1).toUpperCase() + monthLabel.substring(1).toLowerCase());
            monthMap.put("amount", count);
            activityMonth.add(monthMap);
        }

        Map<String, Object> activity = new HashMap<>();
        activity.put("day", activityDay);
        activity.put("week", activityWeek);
        activity.put("month", activityMonth);

        // Recent results
        List<Map<String, Object>> recentResults = results.stream()
                .filter(r -> r.getDate() != null)
                .sorted(Comparator.comparing(Result::getDate).reversed())
                .limit(5)
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    if (r.getUserId() != null) {
                        userRepository.findById(r.getUserId()).ifPresent(u -> {
                            map.put("name", u.getName());
                            map.put("initials", u.getAvatar());
                        });
                    }
                    if (r.getExamId() != null) {
                        examRepository.findById(r.getExamId()).ifPresent(e -> {
                            map.put("examTitle", e.getTitle());
                        });
                    }
                    map.put("date", r.getDate());
                    map.put("score", r.getScore());
                    map.put("passed", r.getPassed());
                    return map;
                }).toList();

        response.put("activity", activity);
        response.put("recentResults", recentResults);

        return response;
    }
}
