# Guide de Test - Système de Signalement de Produits

## Prérequis

1. **Backend démarré** sur `http://localhost:8080`
2. **Frontend démarré** sur `http://localhost:3000` ou via Expo
3. **Base de données** avec les migrations appliquées
4. **Utilisateur connecté** pour tester les signalements

## Tests à Effectuer

### 1. Test de Création de Signalement

#### Étapes :
1. Aller sur la page d'accueil
2. Cliquer sur un produit pour voir ses détails
3. Cliquer sur "Signaler ce produit"
4. Vérifier que l'écran de signalement s'ouvre
5. Sélectionner plusieurs raisons de signalement
6. Ajouter une raison personnalisée (optionnel)
7. Ajouter une description détaillée (optionnel)
8. Cliquer sur "Envoyer le signalement"
9. Vérifier le message de confirmation

#### Résultat attendu :
- Navigation vers l'écran de signalement
- Interface utilisateur intuitive
- Validation des données
- Message de confirmation après envoi

### 2. Test de l'Interface Admin

#### Étapes :
1. Se connecter en tant qu'administrateur
2. Aller dans le menu admin
3. Sélectionner "Modération des produits"
4. Vérifier que les signalements apparaissent dans la liste
5. Cliquer sur un produit signalé pour voir les détails
6. Examiner les informations du signalement
7. Tester les actions de modération (Approuver/Rejeter)

#### Résultat attendu :
- Liste des produits signalés avec leurs détails
- Modal avec informations complètes des signalements
- Actions de modération fonctionnelles
- Filtrage et recherche opérationnels

### 3. Test des API Backend

#### Test avec le script fourni :
```bash
node test-product-reports.js
```

#### Test manuel avec curl :
```bash
# Créer un signalement
curl -X POST http://localhost:8080/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": 1,
    "userId": 1,
    "reasons": ["Prix suspect", "Description trompeuse"],
    "customReason": "Test de signalement",
    "description": "Description de test"
  }'

# Récupérer tous les signalements
curl -X GET http://localhost:8080/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN"

# Récupérer les statistiques
curl -X GET http://localhost:8080/api/reports/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test de Validation

#### Tests de validation à effectuer :
1. **Signalement sans raisons** : Doit afficher une erreur
2. **Signalement sans authentification** : Doit rediriger vers la connexion
3. **Signalement avec données invalides** : Doit afficher des erreurs appropriées
4. **Signalement du même produit plusieurs fois** : Doit être autorisé

### 5. Test de Performance

#### Tests de performance :
1. **Création de nombreux signalements** : Vérifier les performances
2. **Chargement de la liste admin** : Vérifier la vitesse de chargement
3. **Recherche et filtrage** : Vérifier la réactivité

## Points de Vérification

### Frontend
- [ ] Navigation vers l'écran de signalement
- [ ] Sélection multiple de raisons
- [ ] Validation des données
- [ ] Messages d'erreur appropriés
- [ ] Interface responsive
- [ ] Thème sombre/clair

### Backend
- [ ] Création de signalements en base
- [ ] Récupération des signalements
- [ ] Mise à jour des statuts
- [ ] Statistiques correctes
- [ ] Gestion des erreurs
- [ ] Validation des données

### Base de Données
- [ ] Tables créées correctement
- [ ] Relations entre entités
- [ ] Index de performance
- [ ] Contraintes d'intégrité

## Données de Test

### Produits de test :
```sql
INSERT INTO products (id, title, description, price, seller_id, status) 
VALUES (1, 'iPhone Test', 'Description test', 500.0, 1, 'ACTIVE');
```

### Utilisateurs de test :
```sql
INSERT INTO users (id, email, password, first_name, last_name, role) 
VALUES (1, 'test@test.com', 'password', 'Test', 'User', 'USER');
```

### Signalements de test :
```sql
INSERT INTO product_reports (product_id, user_id, status, created_at) 
VALUES (1, 1, 'PENDING', NOW());

INSERT INTO product_report_reasons (report_id, reason) 
VALUES (1, 'Prix suspect');
```

## Dépannage

### Erreurs courantes :

1. **Erreur de compilation** : Vérifier les imports et les types
2. **Erreur de base de données** : Vérifier les migrations
3. **Erreur d'authentification** : Vérifier les tokens JWT
4. **Erreur de navigation** : Vérifier les routes dans le frontend

### Logs à vérifier :
- Backend : `application.log`
- Frontend : Console du navigateur
- Base de données : Logs MySQL/PostgreSQL

## Métriques de Succès

- [ ] Tous les tests passent
- [ ] Interface utilisateur intuitive
- [ ] Performance acceptable (< 2s de chargement)
- [ ] Gestion d'erreurs robuste
- [ ] Données persistées correctement
- [ ] Sécurité appropriée

## Prochaines Étapes

1. **Tests d'intégration** avec l'équipe
2. **Tests de charge** pour la production
3. **Tests de sécurité** approfondis
4. **Documentation utilisateur** finale
5. **Formation des administrateurs** 