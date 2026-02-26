-- NutraKids - Test Data & Initial User Setup
-- Run this AFTER importing the main schema

USE nutrakids;

-- ============================================
-- INSERT TEST USERS
-- ============================================

-- Password hashing in MySQL: password123 = $2y$10$NWb5sDa4JEYvGmGk7FkKn.Yj7YvZKJqQDhjfCa3mfJqKzPQmHLp/K
-- Password hashing in MySQL: password456 = $2y$10$5OOjqTNhNSU0kN0Pq1QJ7eKzQj7YvZKJqQDhjfCa3mfJqKzPQmHLp/K

-- CREATE PARENT USER (Test Account)
INSERT INTO users (email, password_hash, user_type, first_name, last_name)
VALUES (
    'parent@test.com',
    '$2y$10$NWb5sDa4JEYvGmGk7FkKn.Yj7YvZKJqQDhjfCa3mfJqKzPQmHLp/K',  -- password: password123
    'parent',
    'Branko',
    'Slijepcevic'
);

-- Get the parent ID (it should be 1 if this is the first insert)
-- We'll use 1 in the following inserts

-- CREATE HOUSEHOLD
INSERT INTO households (household_name)
VALUES ('Slijepcevic Family');

-- ADD PARENT TO HOUSEHOLD
INSERT INTO household_members (household_id, user_id, role)
VALUES (1, 1, 'parent');

-- CREATE CHILD USER (Test Account)
INSERT INTO users (email, password_hash, user_type, first_name, last_name, age)
VALUES (
    'child_internal_1@nutrakids',
    '$2y$10$5OOjqTNhNSU0kN0Pq1QJ7eKzQj7YvZKJqQDhjfCa3mfJqKzPQmHLp/K',  -- password: password456
    'child',
    'Milica',
    'Slijepcevic',
    12
);

-- ADD CHILD TO HOUSEHOLD
INSERT INTO household_members (household_id, user_id, role)
VALUES (1, 2, 'child');

-- CREATE CHILD PROFILE
INSERT INTO child_profiles (
    child_user_id,
    household_id,
    daily_calorie_target,
    allergies,
    dietary_restrictions,
    health_goals,
    preferred_meal_prep_time,
    cooking_participation,
    onboarding_completed
)
VALUES (
    2,
    1,
    1800,
    '[]',
    '[]',
    '["balanced_nutrition", "more_vegetables"]',
    30,
    'sometimes',
    FALSE
);

-- ============================================
-- INSERT SAMPLE RECIPES
-- ============================================

INSERT INTO recipes (
    title,
    description,
    instructions,
    servings,
    prep_time_minutes,
    cook_time_minutes,
    difficulty_level,
    calories_per_serving,
    protein_g,
    carbs_g,
    fat_g,
    fiber_g,
    meal_type,
    is_vegetarian,
    is_vegan
)
VALUES 
(
    'Simple Pasta with Tomato Sauce',
    'Classic pasta dish with homemade tomato sauce',
    '1. Boil water and cook pasta according to package directions. 2. Sauté garlic in olive oil. 3. Add canned tomatoes and simmer. 4. Combine pasta with sauce and serve.',
    4,
    5,
    20,
    'easy',
    350,
    12,
    55,
    8,
    4,
    'lunch',
    1,
    0
),
(
    'Grilled Chicken Breast with Broccoli',
    'Healthy protein and vegetable combination',
    '1. Season chicken breast with salt and pepper. 2. Grill for 6-7 minutes each side. 3. Steam broccoli for 5 minutes. 4. Serve together with lemon.',
    2,
    10,
    15,
    'easy',
    280,
    35,
    15,
    8,
    3,
    'dinner',
    0,
    0
),
(
    'Oatmeal with Berries',
    'Nutritious breakfast with fresh berries',
    '1. Cook oatmeal according to package directions. 2. Add milk or yogurt. 3. Top with fresh berries and honey. 4. Serve warm.',
    1,
    2,
    5,
    'easy',
    250,
    8,
    45,
    5,
    6,
    'breakfast',
    1,
    1
),
(
    'Vegetable Stir Fry',
    'Quick and colorful vegetable dish',
    '1. Chop vegetables (bell peppers, carrots, broccoli). 2. Heat oil in wok. 3. Stir fry vegetables for 5-7 minutes. 4. Add soy sauce and serve over rice.',
    4,
    15,
    10,
    'easy',
    180,
    8,
    25,
    6,
    5,
    'dinner',
    1,
    1
),
(
    'Turkey and Cheese Sandwich',
    'Simple lunch option with protein',
    '1. Toast bread. 2. Add lettuce and tomato. 3. Layer turkey and cheese. 4. Add condiments and serve.',
    1,
    5,
    0,
    'easy',
    320,
    18,
    30,
    12,
    2,
    'lunch',
    0,
    0
);

-- ============================================
-- INSERT SAMPLE FOOD PREFERENCES
-- ============================================

INSERT INTO food_preferences (child_user_id, food_name, food_category, rating)
VALUES
(2, 'Pasta', 'Grains', 5),
(2, 'Chicken', 'Protein', 4),
(2, 'Pizza', 'Prepared Meals', 4),
(2, 'Apples', 'Fruits', 4),
(2, 'Bananas', 'Fruits', 4),
(2, 'Broccoli', 'Vegetables', 3),
(2, 'Carrots', 'Vegetables', 3),
(2, 'Rice', 'Grains', 4),
(2, 'Fish', 'Protein', 2),
(2, 'Eggs', 'Protein', 4),
(2, 'Cheese', 'Dairy', 5),
(2, 'Yogurt', 'Dairy', 3),
(2, 'Milk', 'Dairy', 3),
(2, 'Bread', 'Grains', 4),
(2, 'Peanut Butter', 'Proteins', 4),
(2, 'Beef', 'Protein', 4),
(2, 'Turkey', 'Protein', 3),
(2, 'Spinach', 'Vegetables', 2),
(2, 'Tomatoes', 'Vegetables', 3),
(2, 'Lettuce', 'Vegetables', 3);

-- ============================================
-- INSERT SAMPLE LOGGED MEALS
-- ============================================

INSERT INTO logged_meals (
    child_user_id,
    household_id,
    meal_date,
    meal_type,
    meal_name,
    meal_rating
)
VALUES
(2, 1, CURDATE(), 'breakfast', 'Oatmeal with berries', 5),
(2, 1, CURDATE(), 'lunch', 'Pasta with tomato sauce', 4),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'breakfast', 'Toast with peanut butter', 4),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'lunch', 'Turkey sandwich', 3),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'dinner', 'Grilled chicken with broccoli', 4);

-- ============================================
-- INSERT SAMPLE WATER INTAKE
-- ============================================

INSERT INTO water_intake (child_user_id, household_id, log_date, cups_consumed)
VALUES
(2, 1, CURDATE(), 6),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 7),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 5);

-- ============================================
-- INSERT SAMPLE MEAL PLAN
-- ============================================

INSERT INTO meal_plans (
    child_user_id,
    household_id,
    plan_name,
    plan_type,
    start_date,
    end_date,
    status,
    generated_by_ai
)
VALUES (
    2,
    1,
    'Sample Week Plan',
    'weekly',
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 6 DAY),
    'active',
    FALSE
);

-- ============================================
-- VERIFY DATA WAS INSERTED
-- ============================================

SELECT 'Users Created:' as Info;
SELECT COUNT(*) as user_count FROM users;

SELECT 'Households Created:' as Info;
SELECT COUNT(*) as household_count FROM households;

SELECT 'Children Profiles Created:' as Info;
SELECT COUNT(*) as child_profile_count FROM child_profiles;

SELECT 'Food Preferences Created:' as Info;
SELECT COUNT(*) as food_pref_count FROM food_preferences;

SELECT 'Recipes Created:' as Info;
SELECT COUNT(*) as recipe_count FROM recipes;

SELECT 'Logged Meals Created:' as Info;
SELECT COUNT(*) as logged_meal_count FROM logged_meals;

SELECT 'Achievements Available:' as Info;
SELECT COUNT(*) as achievement_count FROM achievements;

-- ============================================
-- HOW TO LOGIN
-- ============================================

-- Parent Login:
-- Email: parent@test.com
-- Password: password123

-- After first login, parent can add more children
-- and configure their own profiles.
