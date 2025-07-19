# Système de Signalement de Produits

## Vue d'ensemble

Le système de signalement de produits permet aux utilisateurs de signaler des produits inappropriés ou problématiques. Les signalements sont ensuite examinés par les administrateurs dans l'interface de modération.

## Fonctionnalités

### Côté Frontend

#### 1. Écran de Signalement (`ReportProductScreen.tsx`)
- Interface utilisateur pour créer un signalement
- Sélection multiple de raisons de signalement
- Champ pour raison personnalisée
- Description détaillée optionnelle
- Validation des données avant envoi

#### 2. Intégration dans ProductDetailScreen
- Bouton "Signaler ce produit" dans les actions du produit
- Vérification de l'authentification avant accès
- Navigation vers l'écran de signalement

#### 3. Écran de Modération (`ProductModerationScreen.tsx`)
- Liste des produits signalés avec leurs détails
- Filtrage par statut (pending, approved, rejected, flagged)
- Recherche par titre, description ou vendeur
- Modal détaillée avec informations complètes des signalements
- Actions d'approbation/rejet pour les administrateurs

### Côté Backend

#### 1. Entités
- `ProductReport`: Entité principale pour les signalements
- `ProductReport.ReportStatus`: Enum pour les statuts (PENDING, REVIEWED, RESOLVED)

#### 2. Repository
- `ProductReportRepository`: Gestion des requêtes de base de données
- Méthodes pour récupérer, filtrer et analyser les signalements

#### 3. Service
- `ProductReportService`: Logique métier pour les signalements
- Création, mise à jour, suppression et statistiques

#### 4. Contrôleur
- `ProductReportController`: Endpoints REST API
- Gestion des requêtes HTTP pour les signalements

## Structure de Base de Données

### Table `product_reports`
```sql
CREATE TABLE product_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    custom_reason TEXT,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Table `product_report_reasons`
```sql
CREATE TABLE product_report_reasons (
    report_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    FOREIGN KEY (report_id) REFERENCES product_reports(id)
);
```

## API Endpoints

### POST `/api/reports`
Créer un nouveau signalement
```json
{
  "productId": 1,
  "userId": 1,
  "reasons": ["Prix suspect", "Description trompeuse"],
  "customReason": "Raison personnalisée",
  "description": "Description détaillée"
}
```

### GET `/api/reports`
Récupérer tous les signalements (admin)

### GET `/api/reports/product/{productId}`
Récupérer les signalements d'un produit

### PUT `/api/reports/{reportId}/status`
Mettre à jour le statut d'un signalement
```json
{
  "status": "REVIEWED"
}
```

### DELETE `/api/reports/{reportId}`
Supprimer un signalement

### GET `/api/reports/stats`
Récupérer les statistiques des signalements

## Raisons de Signalement

Les utilisateurs peuvent sélectionner parmi les raisons suivantes :
1. Prix suspect ou trompeur
2. Description trompeuse
3. Produit contrefait
4. Contenu inapproprié
5. Spam ou publicité
6. Produit interdit
7. Informations de contact dans l'annonce
8. Mauvaise catégorisation
9. Photos de mauvaise qualité
10. Autre raison

## Workflow de Modération

1. **Signalement** : L'utilisateur signale un produit
2. **Enregistrement** : Le signalement est sauvegardé avec le statut PENDING
3. **Examen** : L'administrateur examine le signalement dans l'interface de modération
4. **Action** : L'administrateur peut :
   - Approuver le produit (statut APPROVED)
   - Rejeter le produit (statut REJECTED)
   - Marquer comme examiné (statut REVIEWED)
   - Supprimer le signalement

## Statistiques

Le système fournit des statistiques pour les administrateurs :
- Nombre total de signalements
- Signalements par statut (pending, reviewed, resolved)
- Signalements par raison
- Tendances temporelles

## Sécurité

- Authentification requise pour créer des signalements
- Vérification de l'existence des produits et utilisateurs
- Validation des données côté serveur
- Gestion des erreurs appropriée

## Tests

Un script de test est fourni (`test-product-reports.js`) pour vérifier :
- Création de signalements
- Récupération des données
- Mise à jour des statuts
- Statistiques

## Migration

La migration de base de données est incluse dans :
`src/main/resources/db/changelog/add_product_reports_table.xml`

## Utilisation

### Pour les Utilisateurs
1. Aller sur la page de détail d'un produit
2. Cliquer sur "Signaler ce produit"
3. Sélectionner les raisons de signalement
4. Ajouter des détails si nécessaire
5. Soumettre le signalement

### Pour les Administrateurs
1. Aller dans le menu admin
2. Sélectionner "Modération des produits"
3. Examiner les signalements
4. Prendre les actions appropriées

## Maintenance

- Nettoyage périodique des anciens signalements
- Analyse des tendances de signalement
- Mise à jour des raisons de signalement si nécessaire
- Monitoring des performances de la base de données 