-- Fix Emoji Encoding in Foods Table
-- This script properly converts the table to UTF8MB4

-- 1. First, check current structure
DESCRIBE foods;

-- 2. Update the entire table
ALTER TABLE foods 
CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Verify it worked
SHOW CREATE TABLE foods\G

-- 4. Test: Insert a food with emoji
INSERT INTO foods (household_id, food_name, emoji, category, is_active) 
VALUES (1, 'Test Food', '🍕', 'Prepared Meals', TRUE);

-- 5. Verify it displays correctly
SELECT food_id, food_name, emoji, category FROM foods WHERE food_name = 'Test Food';

-- If emoji shows correctly as 🍕, the fix worked!
-- If not, the issue is in the retrieve process or connection charset.
