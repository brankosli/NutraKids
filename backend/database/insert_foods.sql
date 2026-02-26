-- NutraKids Foods Data
-- Insert default foods into the foods table
-- NOTE: Replace HOUSEHOLD_ID with your actual household ID (usually 1 for initial setup)

CREATE TABLE foods ( food_id INT PRIMARY KEY AUTO_INCREMENT, household_id INT, food_name VARCHAR(255), emoji VARCHAR(10), category VARCHAR(100), is_active BOOLEAN DEFAULT TRUE, FOREIGN KEY (household_id) REFERENCES households(household_id) ); 

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

-- Verify insert
SELECT * FROM foods WHERE household_id = 1;
