-- ============================================
-- Add UNIQUE Constraint to Prevent Duplicates
-- Prevents same food_name being added twice to same household
-- ============================================

-- Step 1: Check if constraint already exists
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'foods' 
  AND CONSTRAINT_NAME = 'unique_household_food';

-- Step 2: If constraint doesn't exist, add it
-- This prevents duplicate (household_id, food_name) combinations
ALTER TABLE foods 
ADD CONSTRAINT unique_household_food 
UNIQUE KEY (household_id, food_name);

-- Step 3: Verify it was added
SHOW CREATE TABLE foods\G

-- Step 4: You should see something like:
-- UNIQUE KEY `unique_household_food` (`household_id`,`food_name`)

-- ============================================
-- How It Works
-- ============================================
-- If someone tries: INSERT INTO foods (household_id, food_name, ...)
--   With household_id=1, food_name='Cheese'
-- And there's already a row with household_id=1, food_name='Cheese'
-- Database REJECTS it with: Duplicate entry for key 'unique_household_food'

-- ============================================
-- Testing
-- ============================================

-- Test 1: Try to add duplicate (will FAIL)
-- INSERT INTO foods (household_id, food_name, emoji, category, is_active) 
-- VALUES (1, 'Cheese', '🧀', 'Dairy', TRUE);
-- ERROR 1062: Duplicate entry '1-Cheese' for key 'unique_household_food'

-- Test 2: Different household, same food (will SUCCEED)
-- INSERT INTO foods (household_id, food_name, emoji, category, is_active) 
-- VALUES (2, 'Cheese', '🧀', 'Dairy', TRUE);
-- Query OK, 1 row affected

-- ============================================
-- If You Need to Remove Constraint (NOT RECOMMENDED)
-- ============================================
-- ALTER TABLE foods DROP INDEX unique_household_food;
