package com.examplatform.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuration de la sécurité HTTP de l'application.
 * Définit les filtres JWT, la politique de session (stateless),
 * les règles d'accès aux endpoints et la configuration CORS.
 */
@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    /**
     * Déclare le filtre d'authentification JWT comme bean Spring.
     *
     * @return une instance du filtre {@link AuthTokenFilter}
     */
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    /**
     * Fournisseur d'authentification DAO utilisant {@link UserDetailsServiceImpl}
     * et le BCryptPasswordEncoder.
     *
     * @return le fournisseur d'authentification
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Expose le gestionnaire d'authentification de Spring Security.
     *
     * @param authConfig la configuration d'authentification
     * @return le gestionnaire d'authentification
     * @throws Exception en cas d'erreur de configuration
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Encodeur de mots de passe utilisant BCrypt.
     *
     * @return l'encodeur BCryptPasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configure la chaîne de filtres de sécurité HTTP :
     * CORS, CSRF désactivé, gestion des exceptions, politique de session stateless,
     * règles d'autorisation par endpoint, et ajout du filtre JWT.
     *
     * @param http l'objet HttpSecurity à configurer
     * @return la chaîne de filtres construite
     * @throws Exception en cas d'erreur de configuration
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(org.springframework.security.config.Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers(AntPathRequestMatcher.antMatcher("/error")).permitAll()
                                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/auth/**")).permitAll()
                                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/exams/**")).permitAll()
                                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/results/**")).permitAll()
                                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/subjects/**")).permitAll()
                                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/scheduled-exams/**")).permitAll()
                                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/analytics/**")).permitAll()
                                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/exam-sessions/**")).permitAll()
                                .requestMatchers(AntPathRequestMatcher.antMatcher("/api/admin/**")).authenticated()
                                .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Source de configuration CORS permettant les requêtes cross-origin
     * depuis n'importe quelle origine (utile en développement).
     *
     * @return la source de configuration CORS
     */
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOriginPatterns(java.util.Collections.singletonList("*"));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(false);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
