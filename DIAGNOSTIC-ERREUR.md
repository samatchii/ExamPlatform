# 🚨 DIAGNOSTIC - Erreur "Network Error"

## Le problème
Le frontend React ne peut pas contacter le backend Spring Boot malgré qu'il soit démarré.

---

## ✅ SOLUTION RAPIDE - 5 étapes

### Étape 1: Ouvrir le fichier de test
```
Double-cliquez sur: test-backend.html
```

Ce fichier va tester directement la connexion au backend.

**Résultats possibles:**
- ✅ `Succès! Status: 200` → Backend fonctionne, problème ailleurs
- ❌ `Erreur réseau` → Backend pas accessible
- ❌ `CORS error` → Problème de configuration CORS

---

### Étape 2: Vérifier que le backend écoute bien

**Ouvrez un navigateur et allez sur:**
```
http://localhost:8080/api/exams
```

**Réponse attendue:**
```json
[]
```
(Une liste vide en JSON)

**Si vous voyez:**
- ✅ `[]` → Backend OK !
- ❌ `Page introuvable` / `Connexion refusée` → Backend pas démarré
- ❌ Page blanche → Vérifier les logs du backend

---

### Étape 3: Vérifier les logs du backend

Dans la fenêtre CMD du backend Spring Boot, cherchez:

**✅ Messages de succès:**
```
Started ExamPlatformApplication in X.XXX seconds
Tomcat started on port 8080
```

**❌ Messages d'erreur:**
```
Port 8080 was already in use
Failed to start
Exception in thread
```

---

### Étape 4: Vérifier CORS dans le backend

Le backend doit avoir cette configuration dans chaque contrôleur:

```java
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class ExamController {
    ...
}
```

**Vérification rapide:**
```cmd
cd c:\Users\SAAD\Desktop\pfa\exam-platform\backend-spring\src\main\java\com\examplatform\controller
findstr /s "@CrossOrigin" *.java
```

Vous devriez voir plusieurs lignes. Si rien → C'est le problème !

---

### Étape 5: Nettoyer et redémarrer

**Dans la fenêtre CMD du backend, faites:**
```
Ctrl + C (pour arrêter)
```

**Puis:**
```cmd
cd c:\Users\SAAD\Desktop\pfa\exam-platform\backend-spring
mvn clean
mvn spring-boot:run
```

**Dans le navigateur du frontend:**
```
Ctrl + Shift + R (hard refresh)
ou
F5 (refresh normal)
```

---

## 🔧 Diagnostics avancés

### Test 1: Backend accessible depuis le navigateur?

```
http://localhost:8080/api/exams
```

- ✅ Fonctionne → Problème vient du frontend
- ❌ Ne fonctionne pas → Problème du backend

---

### Test 2: Le port 8080 est-il bien utilisé?

```cmd
netstat -ano | findstr :8080
```

**Résultat attendu:**
```
TCP  0.0.0.0:8080   0.0.0.0:0   LISTENING   <PID>
```

Si rien → Le backend n'écoute pas sur 8080 !

---

### Test 3: Vérifier application.properties

```cmd
cd backend-spring\src\main\resources
type application.properties
```

**Doit contenir:**
```properties
server.port=8080
spring.data.mongodb.uri=mongodb://localhost:27017/dbpfa
```

---

### Test 4: MongoDB connecté?

Dans les logs du backend, cherchez:

**✅ Succès:**
```
Connected to MongoDB
```

**❌ Erreur:**
```
Failed to connect to MongoDB
Connection refused
```

---

## 🛠️ Solutions par erreur

### Erreur: "Port 8080 already in use"

```cmd
# Trouver le processus
netstat -ano | findstr :8080

# Tuer le processus (remplacer <PID>)
taskkill /PID <PID> /F

# Relancer le backend
mvn spring-boot:run
```

---

### Erreur: "Cannot connect to MongoDB"

```cmd
# Vérifier MongoDB
netstat -ano | findstr :27017

# Si rien, démarrer MongoDB
net start MongoDB
# ou
mongod
```

---

### Erreur: CORS

Si le fichier `test-backend.html` montre une erreur CORS, ajoutez ceci au `WebSecurityConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## 🎯 Checklist complète

Cochez ce qui fonctionne:

- [ ] MongoDB démarré (port 27017)
- [ ] Backend démarré (port 8080)
- [ ] Frontend démarré (port 3000)
- [ ] http://localhost:8080/api/exams retourne `[]`
- [ ] test-backend.html montre "Succès"
- [ ] Aucune erreur CORS dans la console du navigateur
- [ ] Logs du backend montrent "Started ExamPlatformApplication"

---

## 📊 Si tout est coché mais ça ne marche toujours pas

### Vérifier la console du navigateur (F12)

**Onglet Console:**
Cherchez les erreurs rouges et notez le message exact.

**Onglet Network:**
- Cliquez sur la requête qui échoue
- Regardez l'onglet "Headers"
- Vérifiez "Request URL" → Doit être `http://localhost:8080/api/...`
- Regardez "Status Code" → Si 0, problème réseau

---

## 🆘 Dernier recours

Si rien ne fonctionne, supprimez le cache:

**Frontend:**
```
1. F12 (ouvrir DevTools)
2. Clic droit sur le bouton refresh
3. Sélectionner "Vider le cache et actualiser"
```

**Backend:**
```cmd
cd backend-spring
mvn clean package
mvn spring-boot:run
```

---

## ✅ TEST FINAL

Une fois que tout est OK, vous devriez voir:

1. **Backend logs:** `Started ExamPlatformApplication`
2. **Browser:** http://localhost:8080/api/exams → `[]`
3. **test-backend.html:** Boutons de test → Tous verts
4. **Frontend:** http://localhost:3000 → Page de connexion (sans erreur)

**Si tout est vert, le projet fonctionne ! 🎉**

---

## 📞 Besoin d'aide?

Envoyez-moi:
1. Screenshot de test-backend.html après les tests
2. Dernières lignes des logs du backend
3. Screenshot de la console du navigateur (F12)
