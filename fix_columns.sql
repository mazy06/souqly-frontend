-- Script pour corriger le type des colonnes title et description
-- de bytea vers text pour permettre l'utilisation de la fonction lower()

-- Vérifier les types actuels
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('title', 'description');

-- Corriger le type de la colonne title
ALTER TABLE products ALTER COLUMN title TYPE text USING title::text;

-- Corriger le type de la colonne description  
ALTER TABLE products ALTER COLUMN description TYPE text USING description::text;

-- Vérifier que les corrections ont été appliquées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('title', 'description'); 