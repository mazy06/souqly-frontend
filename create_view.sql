-- Create a view that explicitly casts title and description to text
-- This should resolve the lower(bytea) issue

CREATE OR REPLACE VIEW products_view AS
SELECT 
    id,
    title::text as title,
    description::text as description,
    price,
    category_id,
    seller_id,
    created_at,
    brand,
    size,
    condition,
    price_with_fees,
    shipping_info,
    status,
    view_count,
    favorite_count,
    updated_at
FROM products;

-- Test the view
SELECT 
    id,
    title,
    lower(title) as title_lower,
    description,
    lower(description) as description_lower
FROM products_view 
LIMIT 3; 