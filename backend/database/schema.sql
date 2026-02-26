-- NutraKids Database Schema
-- Complete database structure for meal planning app with nutritional tracking

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS nutrakids;
USE nutrakids;

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('parent', 'child') NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- ============================================
-- HOUSEHOLD/FAMILY STRUCTURE
-- ============================================

CREATE TABLE IF NOT EXISTS households (
    household_id INT PRIMARY KEY AUTO_INCREMENT,
    household_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS household_members (
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    household_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('parent', 'child') NOT NULL,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_household_user (household_id, user_id)
);

-- ============================================
-- CHILD PROFILE & HEALTH INFO
-- ============================================

CREATE TABLE IF NOT EXISTS child_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL UNIQUE,
    household_id INT NOT NULL,
    date_of_birth DATE,
    
    -- Nutritional Goals
    daily_calorie_target INT,
    daily_protein_target_g DECIMAL(5,2),
    daily_carbs_target_g DECIMAL(5,2),
    daily_fats_target_g DECIMAL(5,2),
    daily_fiber_target_g DECIMAL(5,2),
    
    -- Health Goals
    health_goals TEXT, -- JSON array of goals
    
    -- Allergies & Restrictions
    allergies TEXT, -- JSON array
    dietary_restrictions TEXT, -- JSON array (vegetarian, vegan, gluten-free, etc)
    foods_to_avoid TEXT, -- JSON array of disliked foods
    
    -- Preferences
    preferred_meal_prep_time INT, -- minutes
    cooking_participation ENUM('yes', 'no', 'sometimes') DEFAULT 'sometimes',
    
    -- Onboarding Status
    food_questionnaire_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    INDEX idx_household (household_id)
);

-- ============================================
-- FOOD PREFERENCES (Child's Visual Questionnaire)
-- ============================================

CREATE TABLE IF NOT EXISTS food_preferences (
    preference_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    food_category VARCHAR(100),
    food_image_url VARCHAR(500),
    
    -- Rating: 1=Never tried, 2=Don't like, 3=Okay, 4=Like it, 5=Love it
    rating INT, -- 1-5 scale
    
    rating_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_child_food (child_user_id, food_name),
    INDEX idx_child_id (child_user_id),
    INDEX idx_rating (rating)
);

-- ============================================
-- RECIPE DATABASE
-- ============================================

CREATE TABLE IF NOT EXISTS recipes (
    recipe_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    servings INT DEFAULT 4,
    prep_time_minutes INT,
    cook_time_minutes INT,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    
    -- Nutritional Info (per serving)
    calories_per_serving INT,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    fiber_g DECIMAL(5,2),
    iron_mg DECIMAL(5,2),
    calcium_mg DECIMAL(5,2),
    
    -- Categorization
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    cuisine_type VARCHAR(100),
    tags VARCHAR(500), -- JSON array or comma-separated
    
    -- Allergens & Restrictions
    contains_dairy BOOLEAN,
    contains_gluten BOOLEAN,
    contains_nuts BOOLEAN,
    is_vegetarian BOOLEAN,
    is_vegan BOOLEAN,
    
    -- Content
    recipe_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE,
    INDEX idx_meal_type (meal_type),
    INDEX idx_difficulty (difficulty_level)
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    ingredient_id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2),
    unit VARCHAR(50), -- grams, ml, cup, tsp, tbsp, etc
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id)
);

-- ============================================
-- MEAL PLANS
-- ============================================

CREATE TABLE IF NOT EXISTS meal_plans (
    meal_plan_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL,
    household_id INT NOT NULL,
    plan_name VARCHAR(255),
    plan_type VARCHAR(50), -- 'weekly', 'bi-weekly', etc
    
    -- Plan Duration
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Plan Status
    status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft',
    
    -- AI Generation Info
    generated_by_ai BOOLEAN DEFAULT FALSE,
    ai_prompt_used TEXT, -- Store the prompt used for regeneration reference
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_by_parent_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    INDEX idx_child_id (child_user_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

CREATE TABLE IF NOT EXISTS meal_plan_days (
    plan_day_id INT PRIMARY KEY AUTO_INCREMENT,
    meal_plan_id INT NOT NULL,
    day_of_week INT, -- 1-7 (Monday-Sunday)
    planned_date DATE,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(meal_plan_id) ON DELETE CASCADE,
    INDEX idx_meal_plan_id (meal_plan_id)
);

CREATE TABLE IF NOT EXISTS planned_meals (
    planned_meal_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_day_id INT NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    recipe_id INT NOT NULL,
    notes VARCHAR(500),
    FOREIGN KEY (plan_day_id) REFERENCES meal_plan_days(plan_day_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
    INDEX idx_plan_day_id (plan_day_id),
    INDEX idx_recipe_id (recipe_id)
);

-- ============================================
-- MEAL LOGGING & TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS logged_meals (
    logged_meal_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL,
    household_id INT NOT NULL,
    meal_date DATE NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    
    -- Meal Details
    meal_name VARCHAR(255) NOT NULL,
    recipe_id INT, -- Optional: linked to recipe
    custom_meal_description TEXT, -- For meals not from recipe database
    
    -- Nutritional Tracking
    calories_consumed INT,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    fiber_g DECIMAL(5,2),
    
    -- Child's Rating
    meal_rating INT, -- 1-5 scale: how much they enjoyed it
    
    -- Parent Notes
    parent_notes VARCHAR(500),
    
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
    INDEX idx_child_date (child_user_id, meal_date),
    INDEX idx_meal_date (meal_date)
);

-- ============================================
-- WATER INTAKE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS water_intake (
    water_log_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL,
    household_id INT NOT NULL,
    log_date DATE NOT NULL,
    cups_consumed INT DEFAULT 0,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    UNIQUE KEY unique_child_date (child_user_id, log_date),
    INDEX idx_child_date (child_user_id, log_date)
);

-- ============================================
-- HEALTH METRICS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS health_metrics (
    metric_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL,
    household_id INT NOT NULL,
    metric_date DATE NOT NULL,
    
    energy_level INT, -- 1-10 scale
    mood VARCHAR(50), -- happy, neutral, sad, energetic, tired
    sleep_hours DECIMAL(3,1),
    exercise_minutes INT,
    notes VARCHAR(500),
    
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    INDEX idx_child_date (child_user_id, metric_date)
);

-- ============================================
-- GROCERY LISTS
-- ============================================

CREATE TABLE IF NOT EXISTS grocery_lists (
    list_id INT PRIMARY KEY AUTO_INCREMENT,
    household_id INT NOT NULL,
    meal_plan_id INT,
    list_name VARCHAR(255),
    list_date DATE DEFAULT CURDATE(),
    status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(meal_plan_id),
    INDEX idx_household_id (household_id)
);

CREATE TABLE IF NOT EXISTS grocery_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    list_id INT NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2),
    unit VARCHAR(50),
    category VARCHAR(100), -- fruits, vegetables, proteins, dairy, grains, etc
    is_checked BOOLEAN DEFAULT FALSE,
    price_estimate DECIMAL(8,2),
    notes VARCHAR(300),
    
    FOREIGN KEY (list_id) REFERENCES grocery_lists(list_id) ON DELETE CASCADE,
    INDEX idx_list_id (list_id),
    INDEX idx_category (category)
);

-- ============================================
-- GAMIFICATION & ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS achievements (
    achievement_id INT PRIMARY KEY AUTO_INCREMENT,
    achievement_code VARCHAR(100) UNIQUE,
    achievement_name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    icon_url VARCHAR(500),
    points_awarded INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS child_achievements (
    child_achievement_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id),
    UNIQUE KEY unique_child_achievement (child_user_id, achievement_id),
    INDEX idx_child_id (child_user_id)
);

CREATE TABLE IF NOT EXISTS points_log (
    points_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL,
    points_earned INT,
    reason VARCHAR(255), -- 'logged_meal', 'tried_new_food', 'completed_plan', etc
    related_id INT, -- logged_meal_id, recipe_id, etc
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_child_id (child_user_id)
);

-- ============================================
-- EDUCATIONAL CONTENT
-- ============================================

CREATE TABLE IF NOT EXISTS educational_content (
    content_id INT PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('article', 'video', 'tip', 'challenge') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_body TEXT NOT NULL,
    content_image_url VARCHAR(500),
    target_age_min INT,
    target_age_max INT,
    topic VARCHAR(100), -- nutrition, hydration, healthy_eating, etc
    generated_by_ai BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_topic (topic)
);

CREATE TABLE IF NOT EXISTS content_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    child_user_id INT NOT NULL,
    content_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (child_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES educational_content(content_id),
    INDEX idx_child_id (child_user_id)
);

-- ============================================
-- AI INTEGRATION LOG
-- ============================================

CREATE TABLE IF NOT EXISTS ai_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    household_id INT NOT NULL,
    child_user_id INT,
    request_type VARCHAR(100), -- 'meal_plan_generation', 'recipe_suggestion', etc
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prompt_used TEXT,
    ai_response TEXT,
    approved_by_parent BOOLEAN DEFAULT FALSE,
    approval_date TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (household_id) REFERENCES households(household_id),
    FOREIGN KEY (child_user_id) REFERENCES users(user_id),
    INDEX idx_household_id (household_id),
    INDEX idx_child_id (child_user_id)
);

-- ============================================
-- SESSIONS & LOGIN TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    last_activity TIMESTAMP NULL DEFAULT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token)
);

-- ============================================
-- DEFAULT ACHIEVEMENTS (Insert initial data)
-- ============================================

INSERT INTO achievements (achievement_code, achievement_name, description, points_awarded) VALUES
('first_meal_logged', 'First Meal', 'Logged your first meal', 10),
('week_complete', 'Weekly Champion', 'Completed a full week of meals', 50),
('veggie_explorer', 'Vegetable Explorer', 'Tried 10 different vegetables', 30),
('new_food_five', 'Adventurous Eater', 'Tried 5 new foods', 25),
('water_champion', 'Hydration Hero', 'Drank 8+ cups of water', 15),
('meal_planner', 'Meal Planner', 'Approved your first meal plan', 20);
