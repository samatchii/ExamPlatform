package com.examplatform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Utilitaire pour la gestion des tokens JWT.
 * Fournit les méthodes de génération, validation et extraction
 * des informations contenues dans un token JWT.
 */
@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${examplatform.jwt.secret}")
    private String jwtSecret;

    @Value("${examplatform.jwt.expiration}")
    private int jwtExpirationMs;

    /**
     * Génère un token JWT à partir des informations d'authentification.
     *
     * @param authentication l'objet Authentication contenant les détails de l'utilisateur
     * @return le token JWT signé
     */
    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Construit la clé de signature HMAC à partir de la secret key configurée.
     *
     * @return la clé de signature
     */
    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Extrait le nom d'utilisateur (email) du token JWT.
     *
     * @param token le token JWT
     * @return le nom d'utilisateur contenu dans le token
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * Valide un token JWT en vérifiant sa signature et son intégrité.
     * Gère les exceptions courantes (token malformé, expiré, etc.).
     *
     * @param authToken le token JWT à valider
     * @return true si le token est valide, false sinon
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
}
