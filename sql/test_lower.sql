-- Test the lower function with explicit casting
SELECT 
    id,
    title,
    lower(title::text) as title_lower,
    description,
    lower(description::text) as description_lower
FROM products 
LIMIT 3;

-- Test the exact query that's failing
SELECT 
    id,
    title,
    description
FROM products 
WHERE lower(title::text) like lower('%test%') 
   OR lower(description::text) like lower('%test%')
LIMIT 5; 