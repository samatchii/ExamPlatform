# 🚀 Guide de Démarrage - ExamPlatform

## Prérequis

### Logiciels nécessaires :
- ✅ **Java 17** ou supérieur (pour Spring Boot)
- ✅ **Maven** (pour compiler le backend)
- ✅ **Node.js 16+** et **npm** (pour React)
- ✅ **MongoDB** (base de données)

### Vérifier les installations :
```bash
java -version       # Doit afficher Java 17+
mvn -version        # Doit afficher Maven 3.x
node -version       # Doit afficher Node 16+
npm -version        # Doit afficher npm 8+
```

---

## 📦 Installation

### 1. Installer MongoDB (si pas déjà installé)

**Option A - MongoDB Community (Recommandé):**
- Télécharger depuis: https://www.mongodb.com/try/download/community
- Installer et démarrer le service MongoDB
- Par défaut, MongoDB écoute sur `mongodb://localhost:27017`

**Option B - MongoDB avec Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Vérifier que MongoDB fonctionne:**
```bash
# Essayer de se connecter
mongosh
# ou
mongo
```

---

## 🔧 Configuration

### 1. Backend Spring Boot

Le fichier `backend-spring/src/main/resources/application.properties` est déjà configuré :
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/dbpfa
server.port=8080
examplatform.jwt.secret=votre_secret_jwt_tres_long_et_securise_qui_doit_faire_plus_de_256_bits_pour_hmac
examplatform.jwt.expiration=604800000
```

### 2. Frontend React

Le fichier `src/services/api.js` est configuré pour pointer vers :
```javascript
const API_URL = 'http://localhost:8080/api';
```

---

## ▶️ LANCER LE PROJET

### Option 1 : Lancer tout en une commande (Recommandé)

**Depuis le dossier racine du projet :**
```bash
cd c:\Users\SAAD\Desktop\pfa\exam-platform
npm install
npm run dev
```

Cette commande lance automatiquement :
- Le backend Spring Boot sur `http://localhost:8080`
- Le frontend React sur `http://localhost:3000`

---

### Option 2 : Lancer manuellement (2 terminaux séparés)

#### Terminal 1 - Backend Spring Boot

```bash
cd c:\Users\SAAD\Desktop\pfa\exam-platform\backend-spring
mvn clean install
mvn spring-boot:run
```

**Vérifier que le backend est lancé :**
```
✅ Started ExamPlatformApplication in X.XXX seconds
✅ Server running on port 8080
```

Tester : http://localhost:8080/api/exams (doit retourner un JSON)

---

#### Terminal 2 - Frontend React

**Nouveau terminal :**
```bash
cd c:\Users\SAAD\Desktop\pfa\exam-platform
npm install
npm start
```

**Le navigateur s'ouvre automatiquement sur :**
```
http://localhost:3000
```

---

## 🧪 Tester le Projet

### 1. Créer un compte Admin

**Aller sur :** http://localhost:3000/register

- Nom : `Admin Test`
- Email : `admin@test.com`
- Mot de passe : `admin123`
- Rôle : **Administrateur** 🛡️

Les comptes admin sont automatiquement validés !

---

### 2. Se connecter

**Aller sur :** http://localhost:3000/login

- Email : `admin@test.com`
- Mot de passe : `admin123`

Vous êtes redirigé vers le **Panneau d'administration** !

---

### 3. Créer un Professeur

**Dans l'onglet "Utilisateurs" :**

1. Créer un nouveau compte professeur via `/register` avec rôle **Professeur** 👨🏫
2. Le compte est en attente de validation
3. En tant qu'admin, approuver le compte

---

### 4. Créer un Étudiant

**Même processus :**

1. S'inscrire avec rôle **Étudiant** 🎓
2. Attendre validation admin
3. Admin approuve le compte

---

### 5. Tester le Workflow Complet

#### En tant que Professeur :

1. **Créer un examen** :
   - Onglet "Examens" → "+ Créer un examen"
   - Remplir les informations
   - Ajouter des questions
   - ✅ Sauvegarder → Message : "En attente de validation admin"

2. **Gérer les étudiants** :
   - Onglet "Étudiants"
   - Déclarer statut : Validé, Absent, Rattrapage

3. **Corriger et commenter** :
   - Onglet "Résultats"
   - Modifier le score
   - Ajouter un commentaire

---

#### En tant qu'Admin :

1. **Approuver des examens** :
   - Onglet "En attente" (avec badge rouge)
   - Voir les examens créés par les profs
   - Cliquer sur **Approuver** ✅

2. **Gérer tous les utilisateurs** :
   - Onglet "Utilisateurs"
   - Approuver, Désactiver, Supprimer

---

#### En tant qu'Étudiant :

1. **Voir ses matières** (si configurées)
2. **Voir examens programmés**
3. **Passer un examen** :
   - Aller dans "Examens"
   - Choisir un examen approuvé
   - Cliquer "S'inscrire gratuitement"
   - Répondre aux questions
   - Timer en temps réel
4. **Consulter résultats** :
   - Score obtenu
   - Corrections détaillées
   - **Commentaire du professeur** 💬
5. **Voir son statut** : Validé / Absent / Rattrapage

---

## 🔍 Résolution des problèmes

### Problème 1 : MongoDB ne démarre pas

```bash
# Windows - Démarrer MongoDB manuellement
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### Problème 2 : Port 8080 déjà utilisé

Arrêter le processus qui utilise le port :
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Problème 3 : Port 3000 déjà utilisé

```bash
# Changer le port dans package.json
# Ou arrêter le processus
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problème 4 : Erreur CORS

Vérifier que Spring Boot autorise les requêtes depuis `http://localhost:3000`
Les contrôleurs ont déjà `@CrossOrigin(origins = "*")` ✅

### Problème 5 : Maven ne trouve pas Java

```bash
# Vérifier JAVA_HOME
echo %JAVA_HOME%

# Si vide, configurer :
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%
```

---

## 📊 Structure des URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Application React |
| **Backend API** | http://localhost:8080/api | API Spring Boot |
| **MongoDB** | mongodb://localhost:27017/dbpfa | Base de données |

---

## 🎯 Comptes de test

Après le premier lancement, vous pouvez créer :

| Rôle | Email | Mot de passe | Validation |
|------|-------|--------------|------------|
| Admin | admin@test.com | admin123 | Auto ✅ |
| Professeur | prof@test.com | prof123 | Manuel ⏳ |
| Étudiant | etudiant@test.com | etudiant123 | Manuel ⏳ |

---

## 🛑 Arrêter le projet

**Si lancé avec `npm run dev` :**
```bash
Ctrl + C (dans le terminal)
```

**Si lancé manuellement :**
- Terminal Backend : `Ctrl + C`
- Terminal Frontend : `Ctrl + C`
- MongoDB : `Ctrl + C` ou arrêter le service

---

## 🎉 Félicitations !

Votre plateforme d'examens est maintenant opérationnelle avec :
✅ Gestion complète des utilisateurs
✅ Workflow d'approbation des examens
✅ Système de notation et commentaires
✅ Gestion des statuts étudiants
✅ Interface moderne et responsive

**Bon développement ! 🚀**
