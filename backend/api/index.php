<?php
/**
 * NutraKids API - Minimal Version
 * Just authentication
 */

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');

// Debug: Check file inclusion
$config_file = __DIR__ . '/../config/config.php';
$db_file = __DIR__ . '/../includes/Database.php';

if (!file_exists($config_file)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Config file not found: ' . $config_file]);
    exit;
}

if (!file_exists($db_file)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database file not found: ' . $db_file]);
    exit;
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/FoodSearch.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    if ($action === 'auth_check') {
        if (isset($_SESSION['user_id'])) {
            $db = new Database();
            $db->prepare("SELECT user_id, email, first_name, user_type FROM users WHERE user_id = ?")
                ->bind([['type' => 'i', 'value' => $_SESSION['user_id']]])
                ->execute();
            $user = $db->fetch();
            if ($user) {
                echo json_encode(['authenticated' => true, 'user' => $user]);
            } else {
                echo json_encode(['authenticated' => false]);
            }
        } else {
            echo json_encode(['authenticated' => false]);
        }
    }
    else if ($action === 'parent_login') {
        error_log('DEBUG: parent_login called');
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            error_log('DEBUG: Input received: ' . json_encode($input));
            
            $email = $input['email'] ?? null;
            $password = $input['password'] ?? null;

            error_log('DEBUG: Email=' . ($email ? 'provided' : 'missing') . ', Password=' . ($password ? 'provided' : 'missing'));

            if (!$email || !$password) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email and password required']);
                exit;
            }

            error_log('DEBUG: Creating database connection');
            $db = new Database();
            error_log('DEBUG: Database connection created');

            error_log('DEBUG: Querying for user with email: ' . $email);
            $db->prepare("SELECT user_id, email, first_name, last_name, password_hash, user_type FROM users WHERE email = ?")
                ->bind([['type' => 's', 'value' => $email]])
                ->execute();
            $user = $db->fetch();
            error_log('DEBUG: User query result: ' . json_encode($user));

            if ($user && password_verify($password, $user['password_hash'])) {
                error_log('DEBUG: Password verified for user: ' . $user['email']);
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['user_type'] = $user['user_type'];
                $_SESSION['email'] = $user['email'];
                
                unset($user['password_hash']);
                echo json_encode([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $user
                ]);
            } else {
                error_log('DEBUG: Login failed - user not found or password incorrect');
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            }
        } catch (Exception $e) {
            error_log('DEBUG: Exception in parent_login: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Login error: ' . $e->getMessage()]);
        }
    }
    else if ($action === 'parent_signup') {
        $input = json_decode(file_get_contents('php://input'), true);
        $first_name = $input['first_name'] ?? null;
        $last_name = $input['last_name'] ?? null;
        $email = $input['email'] ?? null;
        $password = $input['password'] ?? null;

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email and password required']);
            exit;
        }

        if (strlen($password) < PASSWORD_MIN_LENGTH) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Password too short']);
            exit;
        }

        $db = new Database();
        $db->prepare("SELECT user_id FROM users WHERE email = ?")
            ->bind([['type' => 's', 'value' => $email]])
            ->execute();

        if ($db->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email already registered']);
            exit;
        }

        $password_hash = password_hash($password, PASSWORD_BCRYPT);

        $db->prepare("INSERT INTO households (household_name) VALUES (?)")
            ->bind([['type' => 's', 'value' => ($last_name ? $last_name : 'My') . ' Family']])
            ->execute();
        $household_id = $db->getLastId();

        $db->prepare("INSERT INTO users (email, password_hash, user_type, first_name, last_name) VALUES (?, ?, 'parent', ?, ?)")
            ->bind([
                ['type' => 's', 'value' => $email],
                ['type' => 's', 'value' => $password_hash],
                ['type' => 's', 'value' => $first_name],
                ['type' => 's', 'value' => $last_name]
            ])
            ->execute();
        $user_id = $db->getLastId();

        $db->prepare("INSERT INTO household_members (household_id, user_id, role) VALUES (?, ?, 'parent')")
            ->bind([
                ['type' => 'i', 'value' => $household_id],
                ['type' => 'i', 'value' => $user_id]
            ])
            ->execute();

        $_SESSION['user_id'] = $user_id;
        $_SESSION['user_type'] = 'parent';
        $_SESSION['email'] = $email;

        echo json_encode([
            'success' => true,
            'message' => 'Account created',
            'user' => [
                'user_id' => $user_id,
                'email' => $email,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'user_type' => 'parent'
            ]
        ]);
    }
    else if ($action === 'logout') {
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out']);
    }
    
    // ============================================
    // CHILD MANAGEMENT ENDPOINTS
    // ============================================
    
    else if ($action === 'create_child') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? null;
        $age = $input['age'] ?? null;
        $allergies = isset($input['allergies']) ? json_encode($input['allergies']) : '[]';
        $goals = isset($input['goals']) ? json_encode($input['goals']) : '[]';
        $calories = $input['calories'] ?? 1800;
        
        if (!$name || !$age) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name and age required']);
            exit;
        }
        
        try {
            $db = new Database();
            
            // Get parent's household ID
            $db->prepare("SELECT household_id FROM household_members WHERE user_id = ? LIMIT 1")
                ->bind([['type' => 'i', 'value' => $_SESSION['user_id']]])
                ->execute();
            $result = $db->fetch();
            
            if (!$result) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Parent household not found']);
                exit;
            }
            
            $household_id = $result['household_id'];
            
            // Create child user
            $db->prepare("INSERT INTO users (email, password_hash, user_type, first_name, age) VALUES (?, ?, 'child', ?, ?)")
                ->bind([
                    ['type' => 's', 'value' => 'child_' . time() . '@internal'],
                    ['type' => 's', 'value' => password_hash('temp_password', PASSWORD_BCRYPT)],
                    ['type' => 's', 'value' => $name],
                    ['type' => 'i', 'value' => $age]
                ])
                ->execute();
            
            $child_user_id = $db->getLastId();
            
            // Create child profile
            $db->prepare("INSERT INTO child_profiles (child_user_id, household_id, daily_calorie_target, allergies, health_goals) VALUES (?, ?, ?, ?, ?)")
                ->bind([
                    ['type' => 'i', 'value' => $child_user_id],
                    ['type' => 'i', 'value' => $household_id],
                    ['type' => 'i', 'value' => $calories],
                    ['type' => 's', 'value' => $allergies],
                    ['type' => 's', 'value' => $goals]
                ])
                ->execute();
            
            // Add child to household
            $db->prepare("INSERT INTO household_members (household_id, user_id, role) VALUES (?, ?, 'child')")
                ->bind([
                    ['type' => 'i', 'value' => $household_id],
                    ['type' => 'i', 'value' => $child_user_id]
                ])
                ->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'Child profile created',
                'child' => [
                    'user_id' => $child_user_id,
                    'first_name' => $name,
                    'age' => $age
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    else if ($action === 'get_children') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        try {
            $db = new Database();
            
            // Get all children in parent's household
            $db->prepare("
                SELECT u.user_id, u.first_name, u.age, cp.daily_calorie_target, cp.allergies, cp.health_goals
                FROM users u
                JOIN household_members hm ON u.user_id = hm.user_id
                JOIN household_members hm2 ON hm.household_id = hm2.household_id
                JOIN child_profiles cp ON u.user_id = cp.child_user_id
                WHERE hm2.user_id = ? AND u.user_type = 'child'
            ")
                ->bind([['type' => 'i', 'value' => $_SESSION['user_id']]])
                ->execute();
            
            $children = $db->fetchAll();
            
            // Parse JSON fields
            foreach ($children as &$child) {
                $child['allergies'] = json_decode($child['allergies'] ?? '[]', true);
                $child['health_goals'] = json_decode($child['health_goals'] ?? '[]', true);
            }
            
            echo json_encode([
                'success' => true,
                'children' => $children
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    // ============================================
    // MEAL LOGGING ENDPOINTS
    // ============================================
    
    else if ($action === 'log_meal') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $child_id = $input['child_id'] ?? null;
        $meal_type = $input['meal_type'] ?? null;
        $meal_name = $input['meal_name'] ?? null;
        $meal_rating = $input['meal_rating'] ?? null;
        
        if (!$child_id || !$meal_type || !$meal_name || !$meal_rating) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }
        
        try {
            $db = new Database();
            
            // Get household ID for the child
            $db->prepare("SELECT household_id FROM child_profiles WHERE child_user_id = ?")
                ->bind([['type' => 'i', 'value' => $child_id]])
                ->execute();
            $result = $db->fetch();
            
            if (!$result) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Child not found']);
                exit;
            }
            
            $household_id = $result['household_id'];
            
            // Log the meal
            $db->prepare("INSERT INTO logged_meals (child_user_id, household_id, meal_date, meal_type, meal_name, meal_rating) VALUES (?, ?, ?, ?, ?, ?)")
                ->bind([
                    ['type' => 'i', 'value' => $child_id],
                    ['type' => 'i', 'value' => $household_id],
                    ['type' => 's', 'value' => date('Y-m-d')],
                    ['type' => 's', 'value' => $meal_type],
                    ['type' => 's', 'value' => $meal_name],
                    ['type' => 'i', 'value' => $meal_rating]
                ])
                ->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'Meal logged successfully',
                'points' => 5
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    else if ($action === 'get_meals') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        $child_id = $_GET['child_id'] ?? null;
        
        if (!$child_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Child ID required']);
            exit;
        }
        
        try {
            $db = new Database();
            
            $db->prepare("
                SELECT logged_meal_id, meal_date, meal_type, meal_name, meal_rating
                FROM logged_meals
                WHERE child_user_id = ?
                ORDER BY meal_date DESC, logged_at DESC
                LIMIT 30
            ")
                ->bind([['type' => 'i', 'value' => $child_id]])
                ->execute();
            
            $meals = $db->fetchAll();
            
            echo json_encode([
                'success' => true,
                'meals' => $meals
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    else if ($action === 'get_achievements') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        $child_id = $_GET['child_id'] ?? null;
        
        if (!$child_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Child ID required']);
            exit;
        }
        
        try {
            $db = new Database();
            
            // Get child's earned achievements
            $db->prepare("
                SELECT 
                    a.achievement_id,
                    a.achievement_code,
                    a.achievement_name as name,
                    a.description,
                    a.points_awarded,
                    a.icon_url,
                    ca.earned_at
                FROM achievements a
                INNER JOIN child_achievements ca ON a.achievement_id = ca.achievement_id AND ca.child_user_id = ?
                ORDER BY ca.earned_at DESC, a.achievement_name ASC
            ")
                ->bind([['type' => 'i', 'value' => $child_id]])
                ->execute();
            
            $achievements = $db->fetchAll();
            
            // Add default emoji in PHP if icon_url is empty
            foreach ($achievements as &$achievement) {
                if (empty($achievement['icon_url'])) {
                    $achievement['icon_url'] = '🏆';
                }
                $achievement['emoji'] = $achievement['icon_url'];
            }
            
            echo json_encode([
                'success' => true,
                'achievements' => $achievements
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    // ============================================
    // FOOD PREFERENCES ENDPOINTS
    // ============================================
    
    else if ($action === 'save_food_preferences') {
        error_log('DEBUG: save_food_preferences called');
        
        if (!isset($_SESSION['user_id'])) {
            error_log('DEBUG: No session user_id');
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        error_log('DEBUG: Session user_id = ' . $_SESSION['user_id']);
        
        $input = json_decode(file_get_contents('php://input'), true);
        error_log('DEBUG: Input received: ' . json_encode($input));
        
        $child_id = $input['child_id'] ?? null;
        $preferences = $input['preferences'] ?? [];
        
        error_log('DEBUG: child_id = ' . $child_id);
        error_log('DEBUG: preferences count = ' . count($preferences));
        
        if (!$child_id || empty($preferences)) {
            error_log('DEBUG: Missing child_id or preferences');
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Child ID and preferences required']);
            exit;
        }
        
        try {
            $db = new Database();
            
            // Verify child belongs to this parent
            error_log('DEBUG: Verifying child ownership');
            $db->prepare("
                SELECT cp.profile_id 
                FROM child_profiles cp
                JOIN household_members hm ON cp.household_id = hm.household_id
                WHERE cp.child_user_id = ? AND hm.user_id = ?
            ")
                ->bind([
                    ['type' => 'i', 'value' => $child_id],
                    ['type' => 'i', 'value' => $_SESSION['user_id']]
                ])
                ->execute();
            
            $child = $db->fetch();
            error_log('DEBUG: Child verification result: ' . ($child ? 'found' : 'not found'));
            
            if (!$child) {
                error_log('DEBUG: Child not found or unauthorized');
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Child not found or unauthorized']);
                exit;
            }
            
            // Delete existing preferences for this child
            error_log('DEBUG: Deleting old preferences for child ' . $child_id);
            $db->prepare("DELETE FROM food_preferences WHERE child_user_id = ?")
                ->bind([['type' => 'i', 'value' => $child_id]])
                ->execute();
            error_log('DEBUG: Deleted ' . $db->getAffectedRows() . ' old preferences');
            
            // Save new preferences - store food_id directly (no need to lookup food_name)
            error_log('DEBUG: Inserting ' . count($preferences) . ' new preferences');
            
            foreach ($preferences as $food_id => $rating) {
                error_log('DEBUG: Inserting food_id=' . $food_id . ', rating=' . $rating);
                
                $db->prepare("INSERT INTO food_preferences (child_user_id, food_id, rating) VALUES (?, ?, ?)")
                    ->bind([
                        ['type' => 'i', 'value' => $child_id],
                        ['type' => 'i', 'value' => $food_id],
                        ['type' => 'i', 'value' => $rating]
                    ])
                    ->execute();
            }
            
            error_log('DEBUG: All preferences inserted successfully');
            
            echo json_encode([
                'success' => true,
                'message' => 'Food preferences saved',
                'count' => count($preferences)
            ]);
        } catch (Exception $e) {
            error_log('DEBUG: Exception caught: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    else if ($action === 'get_household_foods') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        try {
            $db = new Database();
            
            // Get parent's household ID
            $db->prepare("SELECT household_id FROM household_members WHERE user_id = ? LIMIT 1")
                ->bind([['type' => 'i', 'value' => $_SESSION['user_id']]])
                ->execute();
            $result = $db->fetch();
            
            if (!$result) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Household not found']);
                exit;
            }
            
            $household_id = $result['household_id'];
            
            // Get all foods for this household
            $db->prepare("
                SELECT food_id, food_name, emoji, category, is_active
                FROM foods
                WHERE household_id = ?
                ORDER BY category, food_name
            ")
                ->bind([['type' => 'i', 'value' => $household_id]])
                ->execute();
            
            $foods = $db->fetchAll();
            
            echo json_encode([
                'success' => true,
                'foods' => $foods
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    else if ($action === 'add_food') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $food_name = $input['food_name'] ?? null;
        $emoji = $input['emoji'] ?? null;
        $category = $input['category'] ?? null;
        
        if (!$food_name || !$emoji || !$category) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Food name, emoji, and category required']);
            exit;
        }
        
        try {
            $db = new Database();
            
            // Get parent's household ID
            $db->prepare("SELECT household_id FROM household_members WHERE user_id = ? LIMIT 1")
                ->bind([['type' => 'i', 'value' => $_SESSION['user_id']]])
                ->execute();
            $result = $db->fetch();
            
            if (!$result) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Household not found']);
                exit;
            }
            
            $household_id = $result['household_id'];
            
            // CHECK: Food already exists in this household?
            error_log('DEBUG: Checking if food "' . $food_name . '" exists in household ' . $household_id);
            $db->prepare("
                SELECT food_id FROM foods 
                WHERE household_id = ? 
                AND LOWER(food_name) = LOWER(?)
            ")
                ->bind([
                    ['type' => 'i', 'value' => $household_id],
                    ['type' => 's', 'value' => $food_name]
                ])
                ->execute();
            
            $existing = $db->fetch();
            
            if ($existing) {
                error_log('DEBUG: Food already exists! ID: ' . $existing['food_id']);
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => 'This food is already in your household'
                ]);
                exit;
            }
            
            error_log('DEBUG: Food is new, safe to insert');
            
            // Add food (safe - doesn't exist yet)
            $db->prepare("INSERT INTO foods (household_id, food_name, emoji, category, is_active) VALUES (?, ?, ?, ?, TRUE)")
                ->bind([
                    ['type' => 'i', 'value' => $household_id],
                    ['type' => 's', 'value' => $food_name],
                    ['type' => 's', 'value' => $emoji],
                    ['type' => 's', 'value' => $category]
                ])
                ->execute();
            
            $food_id = $db->getLastId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Food added',
                'food_id' => $food_id
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    else if ($action === 'test_claude') {
        error_log('DEBUG: test_claude endpoint called');
        
        echo json_encode([
            'api_key_configured' => defined('CLAUDE_API_KEY') && CLAUDE_API_KEY !== 'sk-ant-YOUR_KEY_HERE',
            'api_key_starts_with' => substr(CLAUDE_API_KEY, 0, 10),
            'model' => CLAUDE_MODEL,
            'url' => CLAUDE_API_URL
        ]);
    }
    
    else if ($action === 'suggest_food') {
        error_log('DEBUG: suggest_food called');
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $food_name = $input['food_name'] ?? null;
        
        error_log('DEBUG: suggest_food input: ' . $food_name);
        
        if (!$food_name || strlen(trim($food_name)) < 2) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Food name required']);
            exit;
        }
        
        try {
            $db = new Database();
            $search = new FoodSearch($db);
            
            // ============================================
            // STEP 1: Check local foods_master database first
            // ============================================
            error_log('DEBUG: Searching local foods database for: ' . $food_name);
            $local_match = $search->searchFood($food_name, 2);  // Tolerance: 2 characters
            
            if ($local_match) {
                error_log('DEBUG: Found in local database: ' . $local_match['food_name']);
                
                // Return local match (NO Claude API call!)
                echo json_encode([
                    'success' => true,
                    'suggestion' => [
                        'corrected_name' => $local_match['food_name'],
                        'emoji' => $local_match['emoji'],
                        'category' => $local_match['category'],
                        'confidence' => $local_match['matched_via'] === 'fuzzy_match' ? 'medium' : 'high',
                        'source' => 'local_database'  // Tell frontend we used local DB
                    ]
                ]);
                exit;
            }
            
            // ============================================
            // STEP 2: Not in local DB - Call Claude API
            // ============================================
            error_log('DEBUG: Food not in local database, calling Claude API');
            
            // Validate Claude API key
            if (!defined('CLAUDE_API_KEY') || CLAUDE_API_KEY === 'sk-ant-YOUR_KEY_HERE') {
                error_log('ERROR: Claude API key not configured');
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Claude API not configured']);
                exit;
            }
            
            $prompt = "I'm building a food tracking app for kids. Parent entered food: \"" . $food_name . "\"

Please respond ONLY with a JSON object (no markdown, no explanation) with:
- corrected_name: (proper spelling of the food)
- emoji: (single food-related emoji)
- category: (one of: Fruits, Vegetables, Protein, Dairy, Grains, Prepared Meals, Snacks, Beverages, Other)
- confidence: (high, medium, or low)

Example response:
{\"corrected_name\": \"Broccoli\", \"emoji\": \"🥦\", \"category\": \"Vegetables\", \"confidence\": \"high\"}";
            
            $ch = curl_init(CLAUDE_API_URL);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'x-api-key: ' . CLAUDE_API_KEY,
                'anthropic-version: 2023-06-01'
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'model' => CLAUDE_MODEL,
                'max_tokens' => 200,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ]
            ]));
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curl_error = curl_error($ch);
            curl_close($ch);
            
            error_log('DEBUG: Claude API response status: ' . $http_code);
            
            if ($http_code !== 200) {
                error_log('DEBUG: Claude API error - status ' . $http_code . ': ' . substr($response, 0, 200));
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Claude API error (status ' . $http_code . ')']);
                exit;
            }
            
            $response_data = json_decode($response, true);
            
            if (!isset($response_data['content'][0]['text'])) {
                error_log('DEBUG: Invalid Claude response structure');
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Invalid response']);
                exit;
            }
            
            $claude_response = $response_data['content'][0]['text'];
            error_log('DEBUG: Claude text response: ' . $claude_response);
            
            // Parse Claude's JSON response
            $suggestion = json_decode($claude_response, true);
            
            if (!$suggestion || !isset($suggestion['emoji']) || !isset($suggestion['category'])) {
                error_log('DEBUG: Could not parse Claude suggestion: ' . $claude_response);
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to parse suggestion']);
                exit;
            }
            
            // ============================================
            // STEP 3: Save Claude response to local database for future use
            // ============================================
            error_log('DEBUG: Saving Claude suggestion to local database');
            $search->saveFood(
                $suggestion['corrected_name'],
                $suggestion['emoji'],
                $suggestion['category'],
                strtolower($food_name) . ',' . strtolower($suggestion['corrected_name'])  // Alternative names
            );
            
            error_log('DEBUG: Food suggestion: ' . json_encode($suggestion));
            
            // Return Claude suggestion with source indicator
            $suggestion['source'] = 'claude_api';  // Tell frontend we used Claude
            echo json_encode([
                'success' => true,
                'suggestion' => $suggestion
            ]);
        } catch (Exception $e) {
            error_log('DEBUG: Exception in suggest_food: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    else if ($action === 'delete_food') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $food_id = $input['food_id'] ?? null;
        
        if (!$food_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Food ID required']);
            exit;
        }
        
        try {
            $db = new Database();
            
            // Verify parent owns this food's household
            $db->prepare("
                SELECT f.food_id 
                FROM foods f
                JOIN household_members hm ON f.household_id = hm.household_id
                WHERE f.food_id = ? AND hm.user_id = ?
            ")
                ->bind([
                    ['type' => 'i', 'value' => $food_id],
                    ['type' => 'i', 'value' => $_SESSION['user_id']]
                ])
                ->execute();
            
            if (!$db->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Not authorized']);
                exit;
            }
            
            // Delete food
            $db->prepare("DELETE FROM foods WHERE food_id = ?")
                ->bind([['type' => 'i', 'value' => $food_id]])
                ->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'Food deleted'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    else if ($action === 'get_food_preferences') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        
        $child_id = $_GET['child_id'] ?? null;
        
        if (!$child_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Child ID required']);
            exit;
        }
        
        try {
            $db = new Database();
            
            // JOIN food_preferences with foods table to get complete data
            $db->prepare("
                SELECT 
                    fp.preference_id,
                    fp.food_id,
                    fp.rating,
                    f.food_name,
                    f.emoji,
                    f.category
                FROM food_preferences fp
                JOIN foods f ON fp.food_id = f.food_id
                WHERE fp.child_user_id = ?
                ORDER BY f.category, f.food_name
            ")
                ->bind([['type' => 'i', 'value' => $child_id]])
                ->execute();
            
            $results = $db->fetchAll();
            
            // Transform to include all data
            $preferences = [];
            foreach ($results as $row) {
                $preferences[] = [
                    'preference_id' => $row['preference_id'],
                    'food_id' => $row['food_id'],
                    'food_name' => $row['food_name'],
                    'emoji' => $row['emoji'],
                    'category' => $row['category'],
                    'rating' => $row['rating']
                ];
            }
            
            echo json_encode([
                'success' => true,
                'preferences' => $preferences
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    // ============================================
    // GAMIFICATION - LOG FOOD (MODIFIED)
    // ============================================

    else if ($action === 'log_food') {
        // Log a single food item
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $child_id = $input['child_id'] ?? null;
        $meal_name = $input['food_name'] ?? null;
        $meal_type = $input['meal_type'] ?? null;
        $meal_rating = $input['meal_rating'] ?? null;

        if (!$child_id || !$meal_type || !$meal_name || !$meal_rating) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }

        try {
            $db = new Database();

            // Get household_id for this child
            $db->prepare("SELECT household_id FROM child_profiles WHERE child_user_id = ?")
                ->bind([['type' => 'i', 'value' => $child_id]])
                ->execute();
            $profile = $db->fetch();

            if (!$profile) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Child profile not found']);
                exit;
            }

            $household_id = $profile['household_id'];

            // Check if this is a new food for this child (first time logging this meal_name)
            $db->prepare("
                SELECT COUNT(*) as count FROM logged_meals 
                WHERE child_user_id = ? AND LOWER(meal_name) = LOWER(?)
            ")
                ->bind([
                    ['type' => 'i', 'value' => $child_id],
                    ['type' => 's', 'value' => $meal_name]
                ])
                ->execute();
            $result = $db->fetch();
            $is_new_food = ($result['count'] == 0);

            // Calculate points
            $points = 10;  // Base
            if ($meal_rating >= 4) {
                $points += 10;  // Good rating bonus
            }
            if ($is_new_food) {
                $points += 20;  // New food bonus
            }

            // Log the meal with points_earned
            $db->prepare("
                INSERT INTO logged_meals (
                    child_user_id, household_id, meal_date, meal_type, 
                    meal_name, meal_rating, points_earned
                ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?)
            ")
                ->bind([
                    ['type' => 'i', 'value' => $child_id],
                    ['type' => 'i', 'value' => $household_id],
                    ['type' => 's', 'value' => $meal_type],
                    ['type' => 's', 'value' => $meal_name],
                    ['type' => 'i', 'value' => $meal_rating],
                    ['type' => 'i', 'value' => $points]
                ])
                ->execute();

            // Update user total points
            $db->prepare("UPDATE users SET points_total = points_total + ? WHERE user_id = ?")
                ->bind([
                    ['type' => 'i', 'value' => $points],
                    ['type' => 'i', 'value' => $child_id]
                ])
                ->execute();

            echo json_encode([
                'success' => true,
                'message' => 'Food logged!',
                'points_earned' => $points,
                'is_new_food' => $is_new_food,
                'bonus_reason' => $is_new_food ? 'First time trying this food!' : ($meal_rating >= 4 ? 'Great rating!' : '')
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    else if ($action === 'log_water') {
        // Log water intake
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $child_id = $input['child_id'] ?? null;
        $cups = $input['cups'] ?? 1;

        if (!$child_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Child ID required']);
            exit;
        }

        try {
            $db = new Database();

            $points = 5 * $cups;  // 5 points per cup

            // Get or create today's water log
            $today = date('Y-m-d');

            // Check if water intake already exists for today
            $db->prepare("SELECT water_intake FROM daily_tracking WHERE child_user_id = ? AND tracking_date = ?")
                ->bind([
                    ['type' => 'i', 'value' => $child_id],
                    ['type' => 's', 'value' => $today]
                ])
                ->execute();
            $existing = $db->fetch();

            if ($existing) {
                // Update existing
                $db->prepare("
                    UPDATE daily_tracking 
                    SET water_intake = water_intake + ?, daily_points = daily_points + ?
                    WHERE child_user_id = ? AND tracking_date = ?
                ")
                    ->bind([
                        ['type' => 'i', 'value' => $cups],
                        ['type' => 'i', 'value' => $points],
                        ['type' => 'i', 'value' => $child_id],
                        ['type' => 's', 'value' => $today]
                    ])
                    ->execute();
            } else {
                // Insert new
                $db->prepare("
                    INSERT INTO daily_tracking (child_user_id, tracking_date, water_intake, daily_points)
                    VALUES (?, ?, ?, ?)
                ")
                    ->bind([
                        ['type' => 'i', 'value' => $child_id],
                        ['type' => 's', 'value' => $today],
                        ['type' => 'i', 'value' => $cups],
                        ['type' => 'i', 'value' => $points]
                    ])
                    ->execute();
            }

            // Update user total points
            $db->prepare("UPDATE users SET points_total = points_total + ? WHERE user_id = ?")
                ->bind([
                    ['type' => 'i', 'value' => $points],
                    ['type' => 'i', 'value' => $child_id]
                ])
                ->execute();

            // Get updated water total
            $db->prepare("SELECT water_intake FROM daily_tracking WHERE child_user_id = ? AND tracking_date = ?")
                ->bind([
                    ['type' => 'i', 'value' => $child_id],
                    ['type' => 's', 'value' => $today]
                ])
                ->execute();
            $tracking = $db->fetch();

            $water_total = (int)($tracking['water_intake'] ?? 0);

            echo json_encode([
                'success' => true,
                'message' => 'Water logged!',
                'points_earned' => $points,
                'water_today' => $water_total,
                'goal' => 8,
                'bonus' => ($water_total >= 8 ? 'Hydration Hero! +20 bonus!' : '')
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }

    else if ($action === 'get_daily_points') {
        // Get today's points and stats
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }

        $child_id = $_GET['child_id'] ?? null;

        if (!$child_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Child ID required']);
            exit;
        }

        try {
            $db = new Database();

            // Get total points
            $db->prepare("SELECT points_total FROM users WHERE user_id = ?")
                ->bind([['type' => 'i', 'value' => $child_id]])
                ->execute();
            $user = $db->fetch();

            // Get today's meals
            $today = date('Y-m-d');
            $db->prepare("
                SELECT COUNT(*) as meals_count, COALESCE(SUM(points_earned), 0) as today_points
                FROM logged_meals 
                WHERE child_user_id = ? AND meal_date = ?
            ")
                ->bind([
                    ['type' => 'i', 'value' => $child_id],
                    ['type' => 's', 'value' => $today]
                ])
                ->execute();
            $meals_data = $db->fetch();

            // Get water intake
            $db->prepare("SELECT water_intake FROM daily_tracking WHERE child_user_id = ? AND tracking_date = ?")
                ->bind([
                    ['type' => 'i', 'value' => $child_id],
                    ['type' => 's', 'value' => $today]
                ])
                ->execute();
            $water_data = $db->fetch();

            $water_intake = (int)($water_data['water_intake'] ?? 0);
            $meals_count = (int)($meals_data['meals_count'] ?? 0);
            $today_points = (int)($meals_data['today_points'] ?? 0);

            // Add water points to today's total
            $today_points += ($water_intake * 5);

            echo json_encode([
                'success' => true,
                'total_points' => (int)($user['points_total'] ?? 0),
                'today_points' => $today_points,
                'meals_logged' => $meals_count,
                'water_intake' => $water_intake,
                'water_goal' => 8
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
    else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
