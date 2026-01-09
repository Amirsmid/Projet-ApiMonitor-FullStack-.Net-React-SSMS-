# 🚀 ApiMonitor - Plateforme de Monitoring API

Une plateforme web complète pour capturer, analyser et visualiser les appels API REST avec des fonctionnalités avancées de monitoring en temps réel.

## ✨ Fonctionnalités

### ✅ **Fonctionnalités Implémentées**

- 🔐 **Authentification JWT** avec rôles Admin/Viewer
- 📊 **Dashboard interactif** avec graphiques temps réel
- 📈 **Analytics avancées** (taux d'erreurs, temps de réponse, P95)
- 🚨 **Détection d'anomalies** automatique
- 📡 **SignalR** pour les mises à jour temps réel
- 🔍 **Filtres dynamiques** (date, méthode, statut, endpoint)
- 📤 **Export CSV** des logs
- 🌙 **Mode sombre/clair** avec persistance
- 🔑 **Gestion des tokens Bearer** (hashage sécurisé)
- 📱 **Interface responsive** (Bootstrap 5)
- 📊 **Graphiques interactifs** (Chart.js)
- 🎯 **Simulation d'appels API** pour tests

### 🎯 **Objectifs Atteints**

- ✅ **Étape 1** : Backend ASP.NET Core complet
- ✅ **Étape 2** : Authentification et rôles
- ✅ **Étape 3** : Analyse des données avec alertes
- ✅ **Étape 4** : Simulation de requêtes API
- ✅ **Étape 5** : SignalR temps réel
- ✅ **Étape 6** : Dashboard frontend moderne
- ✅ **Étape 7** : Export CSV
- ✅ **Étape 8** : Mode sombre/clair
- ✅ **Étape 9** : Gestion des tokens Bearer

## 🛠️ Technologies Utilisées

- **Backend** : ASP.NET Core 8, Entity Framework Core, SignalR
- **Frontend** : HTML5, CSS3, JavaScript ES6+, Bootstrap 5, Chart.js
- **Base de données** : SQL Server
- **Sécurité** : JWT Bearer Tokens, BCrypt
- **Monitoring** : Middleware de logging automatique

## 🚀 Installation et Démarrage

### Prérequis

- .NET SDK 8.x
- SQL Server (ou SQLite)
- PowerShell (pour les scripts de test)

### 1. Configuration

```bash
# Cloner le projet
git clone <repository-url>
cd ApiMonitor

# Restaurer les dépendances
dotnet restore
```

### 2. Configuration de la base de données

```bash
# Créer les migrations
dotnet ef migrations add InitialCreate

# Appliquer les migrations
dotnet ef database update
```

### 3. Configuration de l'application

Éditer `appsettings.json` :

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ApiMonitorDb;User Id=sa;Password=yourpassword;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "VotreCléSecrèteTrèsLongueEtComplexeDe64CaractèresMinimum",
    "Issuer": "ApiMonitor",
    "Audience": "ApiMonitorUsers",
    "ExpiryMinutes": 120
  },
  "Admin": {
    "Email": "admin@local.test",
    "Password": "P@ssw0rd!"
  }
}
```

### 4. Démarrage

```bash
# Lancer l'application
dotnet run
```

L'application sera disponible sur :
- **Dashboard** : https://localhost:7001
- **Swagger API** : https://localhost:7001/swagger

## 📊 Utilisation

### 1. Connexion

Utilisez les identifiants par défaut :
- **Email** : `admin@local.test`
- **Mot de passe** : `P@ssw0rd!`

### 2. Dashboard

Le dashboard principal offre :
- **Vue d'ensemble** : Statistiques en temps réel
- **Graphiques** : Évolution des requêtes et répartition par statut
- **Top Endpoints** : Endpoints les plus utilisés
- **Logs récents** : Dernières requêtes avec filtres
- **Alertes** : Notifications d'anomalies détectées

### 3. Filtres et Export

- **Filtres** : Par méthode, statut, date, endpoint
- **Export CSV** : Téléchargement des données filtrées
- **Mode sombre** : Basculement thème clair/sombre

### 4. Simulation de Tests

```powershell
# Exécuter le script de simulation
.\test-simulator.ps1 -CallCount 200

# Ou avec des paramètres personnalisés
.\test-simulator.ps1 -BaseUrl "https://localhost:7001" -CallCount 500
```

## 🔧 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Création d'utilisateur (Admin)

### Analytics
- `GET /api/analytics/overview` - Vue d'ensemble
- `GET /api/analytics/timeseries` - Série temporelle
- `GET /api/analytics/topendpoints` - Top endpoints
- `GET /api/analytics/tokens` - Statistiques des tokens

### Logs
- `GET /api/logs` - Liste des logs avec filtres
- `POST /api/logs/ingest` - Ingestion de logs
- `GET /api/logs/export/csv` - Export CSV
- `DELETE /api/logs/purge` - Nettoyage des logs

## 🎯 Fonctionnalités Avancées

### Détection d'Anomalies

Le système détecte automatiquement :
- **Taux d'erreur > 10%** : Alerte de dégradation
- **Temps de réponse > 1000ms** : Alerte de performance
- **Pics de trafic** : Détection automatique

### Gestion des Tokens

- **Hashage sécurisé** : Les tokens sont hashés (SHA256)
- **Statistiques d'usage** : Fréquence, dernière utilisation
- **Détection d'anomalies** : Tokens suspects

### SignalR Temps Réel

- **Mises à jour automatiques** : Dashboard sans rechargement
- **Connexion robuste** : Reconnexion automatique
- **Notifications** : Alertes en temps réel

## 📈 Métriques Disponibles

- **Requêtes totales** : Nombre total d'appels
- **Taux de succès** : Pourcentage de requêtes réussies
- **Temps de réponse** : Moyenne, P95, P99
- **Répartition par statut** : 200, 404, 500, etc.
- **Top endpoints** : Endpoints les plus sollicités
- **Géolocalisation** : IPs des clients
- **User Agents** : Types de clients

## 🔒 Sécurité

- **JWT Tokens** : Authentification sécurisée
- **Rôles** : Admin (complet) et Viewer (lecture seule)
- **Hashage** : Tokens Bearer hashés
- **CORS** : Configuration sécurisée
- **Validation** : Paramètres d'entrée validés

## 🧪 Tests

### Tests Automatiques

```bash
# Tests unitaires
dotnet test

# Tests d'intégration
dotnet test --filter Category=Integration
```

### Tests Manuels

1. **Simulation de charge** : Script PowerShell inclus
2. **Tests de performance** : Outils de monitoring intégrés
3. **Tests de sécurité** : Validation des tokens

## 📝 Logs et Monitoring

### Logs Automatiques

Chaque requête est automatiquement loggée avec :
- **Timestamp** : Heure précise
- **Méthode HTTP** : GET, POST, PUT, DELETE
- **Path** : Endpoint appelé
- **Statut** : Code de réponse HTTP
- **Durée** : Temps de traitement
- **IP Client** : Adresse IP source
- **User Agent** : Navigateur/client
- **Token Hash** : Hash du token Bearer (si présent)

### Monitoring

- **Temps réel** : SignalR pour les mises à jour
- **Historique** : Conservation des données
- **Alertes** : Notifications automatiques
- **Export** : Données exportables

## 🚀 Déploiement

### Production

```bash
# Build de production
dotnet publish -c Release

# Variables d'environnement
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__DefaultConnection="your-production-connection-string"
```

### Docker (Optionnel)

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY bin/Release/net8.0/publish/ App/
WORKDIR /App
EXPOSE 80
ENTRYPOINT ["dotnet", "ApiMonitor.dll"]
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Documentation** : Swagger UI intégré
- **Issues** : GitHub Issues
- **Email** : support@apimonitor.com

---

**ApiMonitor** - Monitoring API professionnel et moderne 🚀
