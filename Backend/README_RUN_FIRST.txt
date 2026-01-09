ApiMonitor - Étapes 1 & 2 (Backend + Auth & Rôles)

Pré-requis:
- .NET SDK 8.x : https://dotnet.microsoft.com/download
- (Optionnel) VS Code + C# Dev Kit
- Outil EF Core CLI:  dotnet tool install -g dotnet-ef  (ou mise à jour: dotnet tool update -g dotnet-ef)

Démarrage:
1) Ouvrir un terminal dans le dossier ApiMonitor
2) Ouvrir appsettings.json et remplacer la clé JWT par une valeur longue et secrète (64+ caractères)
3) Exécuter:
   dotnet restore
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   dotnet run

Tests rapides (Swagger: /swagger):
- Connexion (POST /api/auth/login):
  { "email": "admin@local.test", "password": "P@ssw0rd!" }
- Utiliser le token retourné (bouton "Authorize" dans Swagger)
- Créer un utilisateur viewer (POST /api/auth/register) en tant qu'Admin
- Voir les logs (GET /api/logs)
- Ingest (POST /api/logs/ingest) (role Admin)

Note: Un middleware capture automatiquement chaque requête entrante dans la table ApiLogs.
