-- Debug script to check for data type issues
-- Check the actual data types and sample data

-- Check column types
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('title', 'description', 'brand', 'size', 'condition', 'shipping_info', 'status');

-- Check sample data to see if there are any bytea values
SELECT 
    id,
    title,
    CASE 
        WHEN title IS NULL THEN 'NULL'
        WHEN pg_typeof(title) = 'bytea'::regtype THEN 'BYTEA'
        ELSE 'TEXT: ' || left(title::text, 50)
    END as title_type,
    description,
    CASE 
        WHEN description IS NULL THEN 'NULL'
        WHEN pg_typeof(description) = 'bytea'::regtype THEN 'BYTEA'
        ELSE 'TEXT: ' || left(description::text, 50)
    END as description_type
FROM products 
LIMIT 5;

-- Check if there are any bytea columns in the entire table
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'products' 
AND data_type = 'bytea';

-- Test the lower function on sample data
SELECT 
    id,
    title,
    lower(title) as title_lower,
    description,
    lower(description) as description_lower
FROM products 
LIMIT 3; 