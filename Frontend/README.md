# 🚀 ApiMonitor Frontend - React

Frontend moderne pour la plateforme de monitoring API ApiMonitor, développé avec React, TypeScript et Bootstrap.

## ✨ Fonctionnalités

- 🔐 **Authentification JWT** avec gestion des tokens
- 📊 **Dashboard interactif** avec graphiques temps réel
- 📈 **Graphiques Chart.js** pour visualisation des données
- 🔍 **Filtres dynamiques** (date, méthode, statut, endpoint)
- 📤 **Export CSV** des données filtrées
- 🌙 **Mode sombre/clair** avec persistance
- 📡 **SignalR** pour mises à jour temps réel
- 📱 **Interface responsive** (Bootstrap 5)
- ⚡ **Performance optimisée** avec React Hooks

## 🛠️ Technologies

- **React 18** avec TypeScript
- **Bootstrap 5** pour l'interface
- **Chart.js** pour les graphiques
- **SignalR** pour le temps réel
- **Axios** pour les requêtes API
- **React Router** pour la navigation
- **React Icons** pour les icônes

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 16+ et npm
- Backend ApiMonitor en cours d'exécution

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm start
```

L'application sera disponible sur `http://localhost:3000`

### Build de Production

```bash
# Créer le build de production
npm run build

# Tester le build localement
npm run serve
```

## 📁 Structure du Projet

```
src/
├── components/
│   ├── Auth/
│   │   └── Login.tsx              # Composant de connexion
│   ├── Dashboard/
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── OverviewCards.tsx      # Cartes de statistiques
│   │   ├── Charts.tsx             # Graphiques
│   │   ├── Filters.tsx            # Filtres dynamiques
│   │   └── LogsTable.tsx          # Tableau des logs
│   └── Layout/
│       └── Navbar.tsx             # Navigation
├── services/
│   ├── api.ts                     # Service API
│   └── signalR.ts                 # Service SignalR
├── types/
│   └── index.ts                   # Types TypeScript
├── App.tsx                        # Composant principal
├── App.css                        # Styles avec thème sombre
└── index.tsx                      # Point d'entrée
```

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` :

```env
REACT_APP_API_URL=https://localhost:7001
```

### Connexion au Backend

Le frontend se connecte automatiquement au backend ApiMonitor. Assurez-vous que :

1. Le backend est en cours d'exécution sur `https://localhost:7001`
2. CORS est configuré pour autoriser `http://localhost:3000`
3. Les identifiants par défaut sont configurés :
   - Email : `admin@local.test`
   - Mot de passe : `P@ssw0rd!`

## 📊 Utilisation

### 1. Connexion

- Utilisez les identifiants par défaut ou créez un compte
- Le token JWT est automatiquement stocké et géré

### 2. Dashboard

- **Vue d'ensemble** : Statistiques en temps réel
- **Graphiques** : Évolution des requêtes et répartition par statut
- **Filtres** : Recherche et filtrage avancé
- **Logs** : Tableau des requêtes récentes

### 3. Fonctionnalités

- **Filtres dynamiques** : Par méthode, statut, date, endpoint
- **Export CSV** : Téléchargement des données filtrées
- **Mode sombre** : Basculement thème clair/sombre
- **Temps réel** : Mises à jour automatiques via SignalR

## 🎨 Thème et Personnalisation

### Mode Sombre

Le thème sombre est automatiquement appliqué avec des variables CSS :

```css
[data-theme="dark"] {
  --bg-primary: #212529;
  --bg-secondary: #343a40;
  --text-primary: #f8f9fa;
  /* ... */
}
```

### Personnalisation

Modifiez `src/App.css` pour personnaliser les couleurs et styles.

## 🔌 API Integration

### Endpoints Utilisés

- `POST /api/auth/login` - Connexion
- `GET /api/analytics/overview` - Vue d'ensemble
- `GET /api/analytics/timeseries` - Série temporelle
- `GET /api/analytics/topendpoints` - Top endpoints
- `GET /api/logs` - Liste des logs
- `GET /api/logs/export/csv` - Export CSV

### SignalR Events

- `AnalyticsUpdated` - Mise à jour des analytics
- `ReceiveLog` - Nouveau log reçu

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm test -- --coverage

# Tests en mode watch
npm test -- --watch
```

## 📦 Build et Déploiement

### Build de Production

```bash
npm run build
```

### Déploiement

Le dossier `build/` contient les fichiers statiques prêts pour le déploiement.

### Variables d'environnement de Production

```env
REACT_APP_API_URL=https://your-api-domain.com
```

## 🔒 Sécurité

- **JWT Tokens** : Authentification sécurisée
- **HTTPS** : Communication chiffrée
- **CORS** : Configuration sécurisée
- **Validation** : Types TypeScript stricts

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur de connexion API**
   - Vérifiez que le backend est en cours d'exécution
   - Vérifiez l'URL dans `.env`

2. **SignalR ne se connecte pas**
   - Vérifiez la configuration CORS du backend
   - Vérifiez les certificats HTTPS

3. **Graphiques ne s'affichent pas**
   - Vérifiez que Chart.js est installé
   - Vérifiez les données reçues de l'API

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

**ApiMonitor Frontend** - Interface moderne et performante 🚀
