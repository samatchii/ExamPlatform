# 🚀 COMMENT DÉMARRER LE BACKEND - Guide Simple

## ❌ VOTRE PROBLÈME ACTUEL

L'erreur `ERR_CONNECTION_REFUSED` signifie que **le backend Spring Boot n'est PAS démarré**.

Le frontend React (port 3000) essaie de contacter le backend (port 8080), mais personne ne répond.

---

## ✅ SOLUTION EN 3 ÉTAPES

### ÉTAPE 1 : Vérifier Java et Maven

**Ouvrez un terminal CMD et tapez :**

```cmd
java -version
```

**Vous devez voir :**
```
java version "17.x.x" ou supérieur
```

**Si erreur "java n'est pas reconnu" :**
- Installez Java 17 : https://adoptium.net/
- Redémarrez votre ordinateur après l'installation

---

**Ensuite, tapez :**
```cmd
mvn -version
```

**Vous devez voir :**
```
Apache Maven 3.x.x
```

**Si erreur "mvn n'est pas reconnu" :**
- Installez Maven : https://maven.apache.org/download.cgi
- Ajoutez Maven au PATH Windows
- Redémarrez votre terminal

---

### ÉTAPE 2 : Démarrer le Backend

**Option A - Double-clic (Le plus simple) :**
```
Double-cliquez sur : START-BACKEND-SIMPLE.bat
```

**Option B - Ligne de commande :**
```cmd
cd c:\Users\SAAD\Desktop\pfa\exam-platform\backend-spring
mvn spring-boot:run
```

---

### ÉTAPE 3 : Attendre le message de succès

**Dans le terminal, attendez ce message (peut prendre 1-2 minutes) :**

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.1)

...
Started ExamPlatformApplication in 15.234 seconds
```

**✅ Quand vous voyez "Started ExamPlatformApplication" → Le backend est démarré !**

---

### ÉTAPE 4 : Vérifier que ça marche

**Ouvrez un navigateur et allez sur :**
```
http://localhost:8080/api/exams
```

**Vous devez voir :**
```json
[]
```
(ou une liste d'examens si la base de données contient des données)

**Si vous voyez ça → SUCCÈS ! Le backend fonctionne !**

---

### ÉTAPE 5 : Rafraîchir le Frontend

**Retournez sur le frontend :**
```
http://localhost:3000
```

**Appuyez sur F5 pour rafraîchir.**

**L'erreur "Network Error" doit disparaître !** ✅

---

## 🔍 DIAGNOSTIC RAPIDE

### Le backend est-il démarré ?

**Méthode 1 - Terminal :**
```cmd
netstat -ano | findstr :8080
```

**Si vous voyez une ligne :** ✅ Backend démarré
**Si rien :** ❌ Backend PAS démarré

---

**Méthode 2 - Navigateur :**

Allez sur : http://localhost:8080/api/exams

- **Vous voyez `[]`** → ✅ Backend fonctionne
- **"Connexion refusée"** → ❌ Backend PAS démarré
- **"Page introuvable"** → ❌ Backend démarré mais mal configuré

---

## ❌ ERREURS COURANTES

### Erreur 1 : "Port 8080 already in use"

**Quelque chose utilise déjà le port 8080.**

**Solution :**
```cmd
netstat -ano | findstr :8080
taskkill /PID <NUMERO_PID> /F
```

Puis relancez le backend.

---

### Erreur 2 : "Cannot connect to MongoDB"

**MongoDB n'est pas démarré.**

**Solution :**
```cmd
net start MongoDB
```
ou
```cmd
mongod
```

Puis relancez le backend.

---

### Erreur 3 : "JAVA_HOME not set"

**Variable d'environnement manquante.**

**Solution Windows :**
```cmd
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
setx PATH "%PATH%;%JAVA_HOME%\bin"
```

Puis ouvrez un NOUVEAU terminal et réessayez.

---

### Erreur 4 : Maven télécharge des fichiers pendant des heures

**C'est normal la PREMIÈRE fois !**

Maven télécharge toutes les dépendances Java nécessaires (Spring Boot, MongoDB, JWT, etc.).

**Attendez patiemment jusqu'au message "Started ExamPlatformApplication".**

---

## 📋 CHECKLIST COMPLÈTE

Cochez chaque étape :

- [ ] Java 17+ installé (`java -version`)
- [ ] Maven installé (`mvn -version`)
- [ ] MongoDB démarré (port 27017)
- [ ] Terminal ouvert dans `backend-spring/`
- [ ] Commande `mvn spring-boot:run` exécutée
- [ ] Message "Started ExamPlatformApplication" affiché
- [ ] http://localhost:8080/api/exams retourne `[]`
- [ ] Frontend rafraîchi (F5)
- [ ] Plus d'erreur "Network Error" !

---

## ✅ SI TOUT EST OK

**Votre projet devrait maintenant fonctionner avec :**

1. **MongoDB** → Port 27017 ✅
2. **Backend Spring Boot** → Port 8080 ✅
3. **Frontend React** → Port 3000 ✅

**Vous pouvez créer des comptes, créer des examens, etc. !** 🎉

---

## 🆘 BESOIN D'AIDE ?

**Envoyez-moi une capture d'écran de :**

1. Le terminal après `mvn spring-boot:run`
2. Ce que vous voyez sur http://localhost:8080/api/exams
3. L'erreur dans la console du navigateur (F12)

Je vous aiderai à résoudre le problème ! 💪
