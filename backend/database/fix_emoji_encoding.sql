-- ============================================
-- FIX EMOJI ENCODING IN FOODS TABLE
-- ============================================
-- Emojis require UTF-8MB4 (4-byte UTF-8)
-- Regular UTF-8 only supports 3 bytes, causing emoji warnings/errors

-- Step 1: Convert entire table to UTF8MB4
ALTER TABLE foods CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Update column definitions to ensure UTF8MB4
ALTER TABLE foods MODIFY food_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE foods MODIFY emoji VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE foods MODIFY category VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 3: Verify the table structure
SHOW CREATE TABLE foods\G

-- Step 4: Clear any existing data (if needed)
TRUNCATE TABLE foods;

-- Step 5: Insert all default foods with emojis
INSERT INTO foods (household_id, food_name, emoji, category, is_active) VALUES
(1, 'Pasta', '🍝', 'Grains', TRUE),
(1, 'Chicken', '🍗', 'Protein', TRUE),
(1, 'Pizza', '🍕', 'Prepared Meals', TRUE),
(1, 'Apples', '🍎', 'Fruits', TRUE),
(1, 'Bananas', '🍌', 'Fruits', TRUE),
(1, 'Broccoli', '🥦', 'Vegetables', TRUE),
(1, 'Carrots', '🥕', 'Vegetables', TRUE),
(1, 'Rice', '🍚', 'Grains', TRUE),
(1, 'Fish', '🐟', 'Protein', TRUE),
(1, 'Eggs', '🥚', 'Protein', TRUE),
(1, 'Cheese', '🧀', 'Dairy', TRUE),
(1, 'Yogurt', '🥛', 'Dairy', TRUE),
(1, 'Bread', '🍞', 'Grains', TRUE),
(1, 'Peanut Butter', '🥜', 'Proteins', TRUE),
(1, 'Beef', '🥩', 'Protein', TRUE);

-- Step 6: Verify emojis stored correctly
SELECT food_id, emoji, food_name FROM foods ORDER BY food_id;

-- Done!
