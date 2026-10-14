# 🚨 ERREUR RÉSEAU - SOLUTION

## Le problème
Le frontend React (port 3000) ne peut pas contacter le backend Spring Boot (port 8080).

**Erreur:** `Network Error at http://localhost:3000/static/js/bundle.js`

---

## ✅ SOLUTION - Démarrer le Backend

### MongoDB est déjà démarré ✅
```
TCP 127.0.0.1:27017 LISTENING
```

### Maintenant, démarrez le backend Spring Boot :

**Option 1 : Double-cliquer sur le fichier**
```
START-BACKEND.bat
```

**Option 2 : En ligne de commande**
```bash
cd c:\Users\SAAD\Desktop\pfa\exam-platform\backend-spring
mvn spring-boot:run
```

---

## ⏱️ Attendez que le backend démarre

Vous verrez ces messages :

```
[INFO] --- spring-boot:3.2.1:run
...
Started ExamPlatformApplication in X.XXX seconds
```

**Ensuite, testez :**
http://localhost:8080/api/exams

**Réponse attendue :** `[]` (liste vide au début)

---

## 🔄 Rafraîchir le Frontend

Une fois le backend démarré, **rafraîchissez la page** dans le navigateur (F5)

L'erreur "Network Error" devrait disparaître !

---

## 📋 Ordre de démarrage complet

1. ✅ **MongoDB** → Déjà démarré
2. ⏳ **Backend Spring Boot** → À démarrer maintenant
3. ✅ **Frontend React** → Déjà démarré

---

## 🛠️ Si le backend ne démarre pas

### Erreur "Port 8080 already in use"
```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Erreur "Cannot connect to MongoDB"
Vérifiez que MongoDB écoute sur 27017 :
```bash
netstat -ano | findstr :27017
```

### Erreur "JAVA_HOME not set"
```bash
# Vérifier
echo %JAVA_HOME%

# Configurer (adapter le chemin)
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%
```

---

## ✅ Une fois le backend démarré

**Rafraîchissez le navigateur** et vous pourrez :

1. Créer un compte admin
2. Se connecter
3. Créer des examens
4. Gérer les utilisateurs

**Le projet fonctionnera correctement !** 🎉
