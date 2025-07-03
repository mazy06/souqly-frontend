-- Fix column types from bytea to text
-- This script converts the title and description columns from bytea to text

-- First, create a backup of the current data
CREATE TABLE products_backup AS SELECT * FROM products;

-- Convert title column from bytea to text
ALTER TABLE products ALTER COLUMN title TYPE text USING convert_from(title, 'UTF8');

-- Convert description column from bytea to text  
ALTER TABLE products ALTER COLUMN description TYPE text USING convert_from(description, 'UTF8');

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('title', 'description');

-- Ajout d'une colonne booléenne is_active pour la gestion des produits actifs/inactifs
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active boolean;

-- Mettre à jour la colonne pour les produits existants
UPDATE products SET is_active = (status = 'ACTIVE');

-- Mettre la colonne NOT NULL avec une valeur par défaut à true
ALTER TABLE products ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE products ALTER COLUMN is_active SET NOT NULL; 