# 🚀 SCRIPTS DE LANCEMENT - Guide d'utilisation

## 📂 Fichiers créés

Vous avez maintenant 2 scripts pour démarrer le projet automatiquement :

### 1. **LANCER-PROJET.bat** (Recommandé pour Windows)
- ✅ Script batch simple
- ✅ Fonctionne sur toutes les versions de Windows
- ✅ Pas besoin de configurer PowerShell

### 2. **LANCER-PROJET.ps1** (PowerShell - Plus moderne)
- ✅ Plus de fonctionnalités
- ✅ Vérifications avancées
- ✅ Meilleure détection des erreurs

---

## 🎯 LANCEMENT RAPIDE

### Méthode 1 : Double-clic (Le plus simple)

**Windows CMD :**
```
Double-cliquez sur : LANCER-PROJET.bat
```

**PowerShell :**
```
Double-cliquez sur : LANCER-PROJET.ps1
```

Si PowerShell bloque l'exécution :
```powershell
# Ouvrir PowerShell en tant qu'administrateur
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Puis double-cliquez à nouveau sur LANCER-PROJET.ps1
```

---

### Méthode 2 : Ligne de commande

**CMD :**
```cmd
cd c:\Users\SAAD\Desktop\pfa\exam-platform
LANCER-PROJET.bat
```

**PowerShell :**
```powershell
cd c:\Users\SAAD\Desktop\pfa\exam-platform
.\LANCER-PROJET.ps1
```

---

## 📋 Ce que fait le script automatiquement

### ✅ Étape 1 : Vérification MongoDB
- Vérifie si MongoDB est démarré (port 27017)
- Si non démarré → Message d'erreur et arrêt

### ✅ Étape 2 : Démarrage Backend Spring Boot
- Démarre le backend sur le port 8080
- Ouvre une fenêtre CMD séparée
- Attend 15-20 secondes pour le démarrage complet

### ✅ Étape 3 : Démarrage Frontend React
- Démarre le frontend sur le port 3000
- Ouvre une autre fenêtre CMD séparée
- Attend 10-15 secondes pour le démarrage

### ✅ Étape 4 : Ouverture du navigateur
- Ouvre automatiquement http://localhost:3000
- Projet prêt à l'emploi !

---

## ⚡ Ordre de démarrage

```
1. MongoDB       (doit être déjà démarré)
   ↓
2. Backend       (démarré automatiquement)
   ↓
3. Frontend      (démarré automatiquement)
   ↓
4. Navigateur    (ouvert automatiquement)
```

---

## 🔧 Prérequis AVANT de lancer le script

### ✅ MongoDB DOIT être démarré

**Option A : Service Windows**
```cmd
net start MongoDB
```

**Option B : MongoDB en ligne de commande**
```cmd
mongod
```

**Option C : MongoDB avec Docker**
```cmd
docker start mongodb
```

**Vérifier que MongoDB fonctionne :**
```cmd
netstat -ano | findstr :27017
```

Si vous voyez une ligne, MongoDB est OK ✅

---

## 🪟 Fenêtres ouvertes après lancement

Vous aurez **3 fenêtres** :

1. **Lanceur** (celle du script) - Vous pouvez fermer après
2. **Backend Spring Boot** - NE PAS FERMER
3. **Frontend React** - NE PAS FERMER

Et le **navigateur** s'ouvrira automatiquement.

---

## 🛑 Comment ARRÊTER le projet

### Méthode 1 : Fermer les fenêtres CMD
- Fermez la fenêtre "Backend Spring Boot"
- Fermez la fenêtre "Frontend React"

### Méthode 2 : Ctrl+C dans chaque fenêtre
- Dans la fenêtre Backend : `Ctrl + C`
- Dans la fenêtre Frontend : `Ctrl + C`

---

## ❌ Résolution des problèmes

### Problème 1 : "MongoDB n'est pas démarré"

**Solution :**
```cmd
# Démarrer MongoDB d'abord
net start MongoDB

# Ou en ligne de commande
mongod

# Puis relancer le script
LANCER-PROJET.bat
```

---

### Problème 2 : "Port 8080 already in use"

**Solution :**
```cmd
# Trouver le processus
netstat -ano | findstr :8080

# Tuer le processus (remplacer <PID> par le numéro)
taskkill /PID <PID> /F

# Relancer le script
LANCER-PROJET.bat
```

---

### Problème 3 : "Port 3000 already in use"

**Solution :**
```cmd
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus
taskkill /PID <PID> /F

# Relancer le script
LANCER-PROJET.bat
```

---

### Problème 4 : Le backend prend trop de temps

**Solution :**
- Attendez encore 30-60 secondes
- La première fois, Maven télécharge les dépendances
- Vérifiez dans la fenêtre Backend si vous voyez :
  ```
  Started ExamPlatformApplication in X.XXX seconds
  ```

---

### Problème 5 : PowerShell bloque l'exécution

**Solution :**
```powershell
# Ouvrir PowerShell en ADMINISTRATEUR
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Puis relancer LANCER-PROJET.ps1
```

---

## 🎉 Vérification que tout fonctionne

### 1. Backend (API)
Ouvrez dans le navigateur : http://localhost:8080/api/exams

**Réponse attendue :** `[]` (liste vide au début)

### 2. Frontend (Interface)
Le navigateur doit s'ouvrir automatiquement sur : http://localhost:3000

**Page attendue :** Page de connexion/inscription

---

## 📊 Statut des services

| Service | Port | URL | Statut |
|---------|------|-----|--------|
| MongoDB | 27017 | mongodb://localhost:27017 | ✅ Manuel |
| Backend | 8080 | http://localhost:8080/api | ✅ Auto |
| Frontend | 3000 | http://localhost:3000 | ✅ Auto |

---

## 💡 Astuces

### Astuce 1 : Première exécution lente
La première fois, le backend peut prendre 2-3 minutes car Maven télécharge toutes les dépendances Java.

### Astuce 2 : Logs du backend
Consultez la fenêtre "Backend Spring Boot" pour voir les logs en temps réel.

### Astuce 3 : Rechargement automatique
Le frontend React se recharge automatiquement quand vous modifiez le code.

### Astuce 4 : Tester l'API
Utilisez Postman ou le navigateur pour tester :
- http://localhost:8080/api/exams
- http://localhost:8080/api/subjects

---

## ✅ COMMANDE FINALE

**Pour lancer tout le projet en une commande :**

```cmd
cd c:\Users\SAAD\Desktop\pfa\exam-platform
LANCER-PROJET.bat
```

**C'est tout ! Le projet démarre automatiquement ! 🚀**

---

## 🎯 Prochaines étapes

Une fois le projet lancé :

1. Allez sur http://localhost:3000
2. Créez un compte Admin
3. Créez des professeurs et étudiants
4. Créez des examens
5. Testez toutes les fonctionnalités !

**Bon développement ! 💻**
