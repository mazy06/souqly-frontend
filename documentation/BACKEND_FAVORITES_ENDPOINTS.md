# Endpoints Backend pour la Gestion des Favoris

## Vue d'ensemble
Ce document décrit les endpoints backend nécessaires pour gérer les favoris des produits dans l'application Souqly.

## Endpoints Requis

### 1. Récupérer le compteur de favoris d'un produit
**GET** `/api/products/{productId}/favorites/count`

**Réponse :**
```json
{
  "favoriteCount": 42,
  "isFavorite": true
}
```

### 2. Ajouter/Retirer un produit des favoris
**POST** `/api/products/{productId}/favorite`

**Réponse :**
```json
{
  "isFavorite": true,
  "favoriteCount": 43
}
```

### 3. Récupérer les produits favoris de l'utilisateur
**GET** `/api/products/favorites`

**Réponse :**
```json
[
  {
    "id": 1,
    "title": "Nom du produit",
    "price": 29.99,
    "favoriteCount": 42,
    // ... autres champs du produit
  }
]
```

## Modifications de la Base de Données

### Table `favorites`
```sql
CREATE TABLE favorites (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Table `products` - Ajout du champ
```sql
ALTER TABLE products ADD COLUMN favorite_count INT DEFAULT 0;
```

## Triggers SQL pour maintenir le compteur

### Trigger pour incrémenter le compteur
```sql
DELIMITER //
CREATE TRIGGER after_favorite_insert
AFTER INSERT ON favorites
FOR EACH ROW
BEGIN
  UPDATE products 
  SET favorite_count = favorite_count + 1 
  WHERE id = NEW.product_id;
END//
DELIMITER ;
```

### Trigger pour décrémenter le compteur
```sql
DELIMITER //
CREATE TRIGGER after_favorite_delete
AFTER DELETE ON favorites
FOR EACH ROW
BEGIN
  UPDATE products 
  SET favorite_count = favorite_count - 1 
  WHERE id = OLD.product_id;
END//
DELIMITER ;
```

## Logique Backend

### Service FavoritesService
```java
@Service
public class FavoritesService {
    
    public FavoriteResponse toggleFavorite(Long productId, Long userId) {
        // Vérifier si le favori existe déjà
        Optional<Favorite> existingFavorite = favoriteRepository
            .findByUserIdAndProductId(userId, productId);
        
        if (existingFavorite.isPresent()) {
            // Retirer des favoris
            favoriteRepository.delete(existingFavorite.get());
            return new FavoriteResponse(false, getFavoriteCount(productId));
        } else {
            // Ajouter aux favoris
            Favorite favorite = new Favorite(userId, productId);
            favoriteRepository.save(favorite);
            return new FavoriteResponse(true, getFavoriteCount(productId));
        }
    }
    
    public boolean isFavorite(Long productId, Long userId) {
        return favoriteRepository.existsByUserIdAndProductId(userId, productId);
    }
    
    public int getFavoriteCount(Long productId) {
        return favoriteRepository.countByProductId(productId);
    }
}
```

## Sécurité
- Tous les endpoints nécessitent une authentification
- Vérifier que l'utilisateur existe et est actif
- Vérifier que le produit existe et est actif
- Limiter le nombre de favoris par utilisateur si nécessaire

## Performance
- Index sur `(user_id, product_id)` pour les requêtes de favoris
- Index sur `product_id` pour le comptage
- Cache Redis pour les compteurs de favoris populaires 