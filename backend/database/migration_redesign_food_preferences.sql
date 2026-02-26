-- ============================================
-- Food Preferences Table Redesign
-- Migration: Store food_id instead of food_name
-- This creates a proper relational design with food_preferences -> foods
-- ============================================

-- Step 1: Drop the old table (if you want to start fresh)
DROP TABLE IF EXISTS food_preferences;

-- Step 2: Create new, clean structure
CREATE TABLE food_preferences (
    preference_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL,
    food_id INT NOT NULL,
    rating INT DEFAULT NULL,
    rating_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys for referential integrity
    FOREIGN KEY (food_id) REFERENCES foods(food_id) ON DELETE CASCADE,
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_child (child_user_id),
    INDEX idx_food (food_id),
    
    -- Ensure no duplicate preferences for same child-food combo
    UNIQUE KEY unique_child_food (child_user_id, food_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 3: Verify the structure
DESCRIBE food_preferences;

-- Step 4: Test data (optional - to verify structure works)
-- INSERT INTO food_preferences (child_user_id, food_id, rating) VALUES
-- (2, 1, 5),  -- Child 2 rated Pasta (food_id 1) as 5 stars
-- (2, 4, 4),  -- Child 2 rated Apples (food_id 4) as 4 stars
-- (2, 6, 3);  -- Child 2 rated Broccoli (food_id 6) as 3 stars

-- Step 5: Verify with JOIN to see complete data
-- SELECT 
--     fp.preference_id,
--     fp.child_user_id,
--     fp.food_id,
--     f.food_name,
--     f.emoji,
--     f.category,
--     fp.rating,
--     fp.rating_date
-- FROM food_preferences fp
-- JOIN foods f ON fp.food_id = f.food_id
-- WHERE fp.child_user_id = 2
-- ORDER BY f.category, f.food_name;
