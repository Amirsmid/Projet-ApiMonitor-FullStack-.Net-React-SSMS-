# 📊 RAPPORT TECHNIQUE - ApiMonitor
## Plateforme de Monitoring API en Temps Réel

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Composants Backend](#3-composants-backend)
4. [Composants Frontend](#4-composants-frontend)
5. [Flux de données et communication](#5-flux-de-données-et-communication)
6. [Système d'authentification](#6-système-dauthentification)
7. [Analytics et monitoring](#7-analytics-et-monitoring)
8. [Guide d'utilisation](#8-guide-dutilisation)
9. [Déploiement et configuration](#9-déploiement-et-configuration)

---

## 1. VUE D'ENSEMBLE DU PROJET

### 🎯 Objectif
ApiMonitor est une plateforme complète de monitoring d'APIs REST qui permet de :
- **Surveiller** les appels API en temps réel
- **Analyser** les performances et les tendances
- **Détecter** les anomalies et les erreurs
- **Gérer** les utilisateurs avec des rôles différenciés
- **Exporter** les données pour analyse externe

### 🏗️ Architecture générale
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Base de       │
│   React + TS    │◄──►│   ASP.NET Core  │◄──►│   Données       │
│   Bootstrap     │    │   SignalR       │    │   SQL Server    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 2. ARCHITECTURE TECHNIQUE

### 🔧 Stack technologique

#### Backend (ASP.NET Core 8)
- **Framework** : ASP.NET Core 8.0
- **Base de données** : SQL Server avec Entity Framework Core
- **Authentification** : JWT (JSON Web Tokens)
- **Communication temps réel** : SignalR
- **Documentation API** : Swagger/OpenAPI
- **Sécurité** : BCrypt pour le hachage des mots de passe

#### Frontend (React 18)
- **Framework** : React 18 avec TypeScript
- **UI Framework** : Bootstrap 5
- **Graphiques** : Chart.js
- **Communication temps réel** : SignalR Client
- **Routing** : React Router
- **HTTP Client** : Axios

### 📁 Structure des dossiers
```
ApiMonitor/
├── Controllers/          # Endpoints API REST
├── Models/              # Entités de données
├── DTOs/                # Objets de transfert
├── Data/                # Contexte Entity Framework
├── Hubs/                # SignalR Hubs
├── Middleware/          # Middleware personnalisés
├── Services/            # Services métier
└── Migrations/          # Migrations de base de données

apimonitor-frontend/
├── src/
│   ├── components/      # Composants React
│   ├── services/        # Services API
│   ├── types/           # Types TypeScript
│   └── App.css          # Styles globaux
```

---

## 3. COMPOSANTS BACKEND

### 🎮 Controllers (Endpoints API)

#### AuthController
**Rôle** : Gestion de l'authentification et des utilisateurs
```csharp
[HttpPost("login")]     // Connexion utilisateur
[HttpPost("register")]  // Création d'utilisateur (Admin uniquement)
[HttpGet("check-admin-exists")] // Vérification existence admin
```

**Fonctionnement** :
1. **Login** : Vérifie email/mot de passe → génère JWT
2. **Register** : Crée nouvel utilisateur avec rôle (Admin/Viewer)
3. **Sécurité** : Mots de passe hachés avec BCrypt

#### AnalyticsController
**Rôle** : Fournit les données d'analyse et de statistiques
```csharp
[HttpGet("overview")]        // Vue d'ensemble (totaux, moyennes)
[HttpGet("timeseries")]      // Données temporelles (graphiques)
[HttpGet("topendpoints")]    // Endpoints les plus utilisés
[HttpGet("tokens")]          // Statistiques des tokens
```

**Fonctionnement** :
1. **Overview** : Calcule totaux, moyennes, pourcentages d'erreur
2. **TimeSeries** : Groupe les logs par intervalles (heure/jour)
3. **TopEndpoints** : Trie les endpoints par fréquence d'usage
4. **Tokens** : Analyse l'utilisation des tokens d'authentification

#### LogsController
**Rôle** : Gestion des logs d'API
```csharp
[HttpGet]              // Récupération des logs avec filtres
[HttpGet("export/csv")] // Export CSV des logs
[HttpPost("ingest")]   // Ingestion de nouveaux logs
[HttpDelete("purge")]  // Suppression des anciens logs
```

**Fonctionnement** :
1. **GET** : Pagination, filtres par méthode, statut, date, chemin
2. **Export** : Génération de fichiers CSV pour analyse externe
3. **Ingest** : Ajout de logs via API (pour intégration externe)
4. **Purge** : Nettoyage des logs anciens (gestion de l'espace)

#### TokensController
**Rôle** : Analyse des tokens d'authentification
```csharp
[HttpGet("summary")]      // Résumé des tokens
[HttpGet("suspicious")]   // Tokens suspects (anomalies)
[HttpGet("expired")]      // Tokens expirés/inactifs
```

### 📊 Models (Entités de données)

#### User
```csharp
public class User
{
    public int Id { get; set; }
    public string Email { get; set; }           // Email unique
    public string DisplayName { get; set; }     // Nom d'affichage
    public string PasswordHash { get; set; }    // Mot de passe haché
    public string Role { get; set; }            // Admin ou Viewer
    public DateTime CreatedUtc { get; set; }    // Date de création
}
```

#### ApiLog
```csharp
public class ApiLog
{
    public int Id { get; set; }
    public DateTime TimestampUtc { get; set; }  // Horodatage
    public string Method { get; set; }          // GET, POST, PUT, DELETE
    public string Path { get; set; }            // Chemin de l'endpoint
    public string? QueryString { get; set; }    // Paramètres de requête
    public int StatusCode { get; set; }         // Code de réponse HTTP
    public long? DurationMs { get; set; }       // Durée de traitement
    public string? ClientIp { get; set; }       // Adresse IP client
    public string? UserAgent { get; set; }      // User-Agent du navigateur
    public string? TokenHash { get; set; }      // Hash du token (anonymisé)
}
```

### 🔄 DTOs (Data Transfer Objects)

#### Pourquoi utiliser des DTOs ?

**1. Sécurité** : Les DTOs évitent l'exposition de données sensibles
```csharp
// ❌ Mauvais : exposer directement le modèle User
public User GetUser(int id) { return _db.Users.Find(id); }

// ✅ Bon : utiliser un DTO qui masque le PasswordHash
public UserDto GetUser(int id) { 
    return _db.Users.Where(u => u.Id == id)
                   .Select(u => new UserDto { Email = u.Email, Role = u.Role })
                   .FirstOrDefault(); 
}
```

**2. Validation** : Contrôle des données d'entrée
```csharp
public record RegisterRequest(
    [param: Required, EmailAddress] string Email,
    [param: Required, MinLength(3)] string DisplayName,
    [param: Required, MinLength(6)] string Password,
    [param: Required] string Role
);
```

**3. Versioning** : Évolution de l'API sans casser les clients
```csharp
// Version 1
public record UserResponse(string Email, string Role);

// Version 2 (ajout de DisplayName sans casser l'existant)
public record UserResponse(string Email, string Role, string DisplayName);
```

**4. Performance** : Transfert uniquement des données nécessaires
```csharp
// Au lieu de transférer tout l'objet ApiLog (potentiellement lourd)
public record LogSummaryDto(
    DateTime Timestamp,
    string Method,
    string Path,
    int StatusCode,
    long DurationMs
);
```

#### DTOs principaux du projet

**AuthDtos.cs** :
- `LoginRequest` : Email + mot de passe
- `RegisterRequest` : Email + mot de passe + nom + rôle
- `AuthResponse` : Token JWT + informations utilisateur

**AnalyticsDtos.cs** :
- `OverviewDataDto` : Totaux, moyennes, pourcentages
- `TimeSeriesPointDto` : Point de données temporelles
- `EndpointStatsDto` : Statistiques par endpoint
- `TokenStatsDto` : Statistiques par token

### 🗄️ Data (Entity Framework)

#### AppDbContext
```csharp
public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<ApiLog> ApiLogs { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuration des relations et contraintes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
            
        modelBuilder.Entity<ApiLog>()
            .HasIndex(l => l.TimestampUtc);
    }
}
```

**Fonctionnalités** :
- **Migrations** : Évolution automatique du schéma de base
- **Indexation** : Optimisation des requêtes fréquentes
- **Relations** : Gestion des liens entre entités
- **Validation** : Contraintes au niveau base de données

### 🔌 Hubs (SignalR)

#### LogsHub
```csharp
public class LogsHub : Hub
{
    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }
    
    public async Task SendLogUpdate(ApiLog log)
    {
        await Clients.All.SendAsync("LogReceived", log);
    }
}
```

**Pourquoi SignalR ?**

**1. Communication temps réel** :
- Mise à jour automatique du dashboard
- Notifications instantanées d'erreurs
- Synchronisation multi-utilisateurs

**2. Performance** :
- WebSockets pour connexions persistantes
- Fallback automatique (Server-Sent Events, Long Polling)
- Optimisation de la bande passante

**3. Simplicité d'utilisation** :
```javascript
// Côté client
connection.on("LogReceived", (log) => {
    updateDashboard(log);
});
```

**4. Groupes et ciblage** :
```csharp
// Envoyer à tous les admins
await Clients.Group("Admins").SendAsync("Alert", alert);

// Envoyer à un utilisateur spécifique
await Clients.User(userId).SendAsync("Notification", message);
```

### 🛡️ Middleware

#### RequestLoggingMiddleware
```csharp
public async Task Invoke(HttpContext context, AppDbContext db)
{
    var sw = Stopwatch.StartNew();
    
    // Extraction du token (anonymisé)
    string? tokenHash = ExtractTokenHash(context);
    
    try
    {
        await _next(context);
    }
    finally
    {
        // Enregistrement du log
        var log = new ApiLog
        {
            TimestampUtc = DateTime.UtcNow,
            Method = context.Request.Method,
            Path = context.Request.Path,
            StatusCode = context.Response.StatusCode,
            DurationMs = sw.ElapsedMilliseconds,
            TokenHash = tokenHash
        };
        
        db.ApiLogs.Add(log);
        await db.SaveChangesAsync();
    }
}
```

**Fonctionnalités** :
- **Logging automatique** : Tous les appels API sont enregistrés
- **Anonymisation** : Hash des tokens pour la sécurité
- **Performance** : Mesure du temps de traitement
- **Métadonnées** : IP, User-Agent, paramètres de requête

---

## 4. COMPOSANTS FRONTEND

### 🎨 Architecture React

#### Structure des composants
```
src/
├── components/
│   ├── Auth/
│   │   └── Login.tsx           # Formulaire de connexion/inscription
│   ├── Dashboard/
│   │   ├── Dashboard.tsx       # Page principale
│   │   ├── OverviewCards.tsx   # Cartes de statistiques
│   │   ├── Charts.tsx          # Graphiques Chart.js
│   │   ├── LogsPage.tsx        # Page des logs
│   │   ├── AnalyticsPage.tsx   # Page d'analytics
│   │   ├── LogsTable.tsx       # Tableau des logs
│   │   └── Filters.tsx         # Filtres de recherche
│   └── Layout/
│       └── Navbar.tsx          # Barre de navigation
├── services/
│   ├── api.ts                  # Service API REST
│   └── signalR.ts              # Service SignalR
└── types/
    └── index.ts                # Types TypeScript
```

### 🔧 Services

#### api.ts (Service API REST)
```typescript
class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: 'https://localhost:5001',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Intercepteur pour ajouter le token JWT
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // Intercepteur pour gérer les erreurs 401
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}
```

**Fonctionnalités** :
- **Authentification automatique** : Ajout du token JWT à chaque requête
- **Gestion d'erreurs** : Redirection automatique en cas d'expiration
- **Configuration centralisée** : URL de base, headers par défaut
- **Types TypeScript** : Sécurité de type pour les réponses API

#### signalR.ts (Service SignalR)
```typescript
class SignalRService {
  private connection: signalR.HubConnection;
  
  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/hubs/logs')
      .withAutomaticReconnect()
      .build();
  }
  
  async startConnection(): Promise<void> {
    await this.connection.start();
  }
  
  setOnLogReceived(callback: (log: ApiLog) => void): void {
    this.connection.on('LogReceived', callback);
  }
  
  setOnOverviewUpdate(callback: (data: OverviewData) => void): void {
    this.connection.on('OverviewUpdated', callback);
  }
}
```

**Fonctionnalités** :
- **Reconnexion automatique** : Gestion des déconnexions réseau
- **Callbacks typés** : Sécurité TypeScript pour les événements
- **Gestion d'état** : Suivi de l'état de connexion
- **Performance** : Connexion WebSocket persistante

### 🎯 Composants principaux

#### Dashboard.tsx
```typescript
const Dashboard: React.FC = () => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  
  useEffect(() => {
    loadDashboard();
    setupSignalR();
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(loadDashboard, 30000);
    
    return () => {
      clearInterval(interval);
      signalRService.stopConnection();
    };
  }, []);
  
  const setupSignalR = async () => {
    signalRService.setOnOverviewUpdate((data) => {
      setOverviewData(data);
    });
    
    signalRService.setOnLogReceived((log) => {
      setLogs(prevLogs => [log, ...prevLogs.slice(0, 49)]);
    });
    
    await signalRService.startConnection();
    setConnectionStatus('Connected');
  };
};
```

**Fonctionnalités** :
- **Données en temps réel** : Mise à jour automatique via SignalR
- **Actualisation périodique** : Fallback toutes les 30 secondes
- **Gestion d'erreurs** : Affichage des erreurs de connexion
- **Performance** : Limitation du nombre de logs affichés

#### LogsPage.tsx
```typescript
const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(false);
  
  const handleFiltersChange = async (newFilters: FilterOptions) => {
    setLoading(true);
    try {
      const filteredLogs = await apiService.getLogs(newFilters, 1, 50);
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = async () => {
    const blob = await apiService.exportCsv(filters);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apilogs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
};
```

**Fonctionnalités** :
- **Filtrage avancé** : Par méthode, statut, date, chemin
- **Pagination** : Chargement par lots pour les performances
- **Export CSV** : Téléchargement des données filtrées
- **Interface responsive** : Adaptation mobile/desktop

---

## 5. FLUX DE DONNÉES ET COMMUNICATION

### 🔄 Flux d'authentification
```
1. Utilisateur saisit email/mot de passe
2. Frontend → POST /api/auth/login
3. Backend vérifie credentials → génère JWT
4. Frontend stocke token dans localStorage
5. Token ajouté automatiquement aux requêtes suivantes
6. Backend valide token sur chaque requête protégée
```

### 📊 Flux de monitoring
```
1. Requête API → RequestLoggingMiddleware
2. Middleware enregistre log en base
3. SignalR Hub notifie les clients connectés
4. Frontend reçoit notification → met à jour dashboard
5. Analytics calculées en temps réel
6. Alertes générées si seuils dépassés
```

### 🔍 Flux d'analyse
```
1. Utilisateur accède à Analytics
2. Frontend → GET /api/analytics/overview
3. Backend calcule statistiques depuis ApiLogs
4. Données retournées au frontend
5. Graphiques mis à jour avec Chart.js
6. Filtres appliqués → nouvelles requêtes
```

---

## 6. SYSTÈME D'AUTHENTIFICATION

### 🔐 JWT (JSON Web Tokens)

#### Structure du token
```json
{
  "sub": "1",                    // ID utilisateur
  "email": "admin@local.test",   // Email
  "name": "Admin",               // Nom d'affichage
  "role": "Admin",               // Rôle (Admin/Viewer)
  "exp": 1757624859,            // Expiration
  "iss": "ApiMonitor",          // Émetteur
  "aud": "ApiMonitorUsers"      // Audience
}
```

#### Sécurité
- **Expiration** : 1 heure par défaut
- **Signature** : Clé secrète côté serveur
- **Validation** : Vérification à chaque requête
- **Rôles** : Contrôle d'accès granulaire

### 👥 Système de rôles

#### Admin
- **Accès complet** : Toutes les fonctionnalités
- **Gestion utilisateurs** : Création de comptes
- **Administration** : Purge des logs, configuration
- **Analytics avancées** : Toutes les métriques

#### Viewer
- **Lecture seule** : Consultation des données
- **Dashboard** : Vue d'ensemble
- **Logs** : Consultation et export
- **Analytics** : Graphiques et statistiques

---

## 7. ANALYTICS ET MONITORING

### 📈 Métriques collectées

#### Performance
- **Durée de traitement** : Temps de réponse des APIs
- **Débit** : Nombre de requêtes par minute/heure
- **Latence** : Temps moyen de réponse
- **Erreurs** : Taux d'erreur par endpoint

#### Utilisation
- **Endpoints populaires** : Fréquence d'utilisation
- **Méthodes HTTP** : Répartition GET/POST/PUT/DELETE
- **Codes de statut** : Distribution 200/400/500
- **Utilisateurs actifs** : Tokens utilisés

#### Sécurité
- **Tokens suspects** : Utilisation anormale
- **IPs suspectes** : Adresses avec taux d'erreur élevé
- **Tentatives d'intrusion** : Requêtes malformées
- **Sessions expirées** : Tokens invalides

### 🚨 Détection d'anomalies

#### Algorithmes utilisés
```csharp
// Détection de pics de latence
var avgLatency = logs.Average(l => l.DurationMs);
var threshold = avgLatency * 2; // 200% de la moyenne
var anomalies = logs.Where(l => l.DurationMs > threshold);

// Détection de taux d'erreur élevé
var errorRate = logs.Count(l => l.StatusCode >= 400) / (double)logs.Count;
if (errorRate > 0.05) // 5% de seuil
{
    alerts.Add($"Taux d'erreur élevé: {errorRate:P}");
}
```

#### Types d'alertes
- **Performance** : Latence > 2x moyenne
- **Erreurs** : Taux d'erreur > 5%
- **Volume** : Pic de trafic > 3x normal
- **Sécurité** : Tentatives d'intrusion détectées

---

## 8. GUIDE D'UTILISATION

### 🚀 Démarrage rapide

#### 1. Prérequis
```bash
# Backend
- .NET 8 SDK
- SQL Server (LocalDB ou Express)
- Visual Studio 2022 ou VS Code

# Frontend
- Node.js 18+
- npm ou yarn
```

#### 2. Configuration base de données
```bash
# Dans le dossier ApiMonitor
dotnet ef database update
```

#### 3. Démarrage des services
```bash
# Terminal 1 - Backend
cd ApiMonitor
dotnet run

# Terminal 2 - Frontend
cd apimonitor-frontend
npm start
```

#### 4. Accès
- **Frontend** : http://localhost:3000
- **API** : https://localhost:5001
- **Swagger** : https://localhost:5001/swagger

### 👤 Utilisation

#### Connexion
1. Ouvrir http://localhost:3000
2. Utiliser les identifiants par défaut :
   - Email : `admin@local.test`
   - Mot de passe : `P@ssw0rd!`

#### Navigation
- **Dashboard** : Vue d'ensemble en temps réel
- **Logs** : Consultation et filtrage des logs
- **Analytics** : Graphiques et statistiques avancées

#### Fonctionnalités Admin
- **Créer un compte** : Bouton dans la navbar
- **Gérer les utilisateurs** : Via l'interface
- **Purger les logs** : Nettoyage de la base

### 📊 Interprétation des données

#### Dashboard
- **Total Requêtes** : Nombre total d'appels API
- **Erreurs** : Pourcentage de requêtes en erreur
- **Latence Moyenne** : Temps de réponse moyen
- **Débit** : Requêtes par minute

#### Graphiques
- **Time Series** : Évolution dans le temps
- **Top Endpoints** : Endpoints les plus utilisés
- **Token Stats** : Utilisation des tokens

---

## 9. DÉPLOIEMENT ET CONFIGURATION

### 🏗️ Configuration de production

#### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server;Database=ApiMonitor;Trusted_Connection=true;"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-here",
    "ExpirationHours": 24
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

#### Variables d'environnement
```bash
# Backend
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=https://+:443

# Frontend
REACT_APP_API_URL=https://your-api-domain.com
```

### 🐳 Docker (Optionnel)

#### Dockerfile Backend
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ApiMonitor.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ApiMonitor.dll"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: ./ApiMonitor
    ports:
      - "5000:80"
    environment:
      - ConnectionStrings__DefaultConnection=Server=db;Database=ApiMonitor;User=sa;Password=YourPassword123;
    depends_on:
      - db
  
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - SA_PASSWORD=YourPassword123
      - ACCEPT_EULA=Y
    ports:
      - "1433:1433"
  
  frontend:
    build: ./apimonitor-frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://api:80
```

### 📈 Monitoring en production

#### Métriques recommandées
- **CPU/Mémoire** : Utilisation des ressources serveur
- **Base de données** : Taille, performance des requêtes
- **Logs** : Rotation et archivage
- **Sécurité** : Tentatives d'intrusion, tokens expirés

#### Alertes
- **Disponibilité** : API inaccessible
- **Performance** : Latence > seuil configuré
- **Erreurs** : Taux d'erreur > 5%
- **Stockage** : Espace disque < 20%

---

## 🎯 CONCLUSION

ApiMonitor est une solution complète de monitoring d'APIs qui combine :

### ✅ Points forts
- **Architecture moderne** : ASP.NET Core + React + SignalR
- **Temps réel** : Mise à jour instantanée des données
- **Sécurité** : JWT, rôles, anonymisation des données
- **Extensibilité** : Architecture modulaire et évolutive
- **Performance** : Optimisations base de données et frontend

### 🔮 Évolutions possibles
- **Machine Learning** : Détection d'anomalies avancée
- **Multi-tenant** : Support de plusieurs organisations
- **Intégrations** : Slack, Teams, email notifications
- **Métriques custom** : Définition de métriques métier
- **API Gateway** : Intégration avec des solutions existantes

### 📚 Technologies maîtrisées
- **Backend** : C#, ASP.NET Core, Entity Framework, SignalR
- **Frontend** : React, TypeScript, Bootstrap, Chart.js
- **Base de données** : SQL Server, migrations, indexation
- **Sécurité** : JWT, BCrypt, validation, autorisation
- **DevOps** : Docker, configuration, déploiement

---

*Rapport généré le : ${new Date().toLocaleDateString('fr-FR')}*
*Version du projet : 1.0.0*
