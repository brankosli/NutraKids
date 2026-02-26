<?php
/**
 * FoodSearch - Fuzzy text matching for food database
 * Handles typos, spelling mistakes, and similar names
 */

class FoodSearch {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Calculate Levenshtein distance between two strings
     * Used for fuzzy matching to catch typos
     * 
     * Example:
     * strawberrys → strawberry = distance 1 (one character difference)
     * brocoli → broccoli = distance 1
     * 
     * @param string $s1 First string
     * @param string $s2 Second string
     * @return int Edit distance (lower = more similar)
     */
    private function levenshteinDistance($s1, $s2) {
        $s1 = strtolower(trim($s1));
        $s2 = strtolower(trim($s2));
        
        if ($s1 === $s2) return 0;
        if (strlen($s1) === 0) return strlen($s2);
        if (strlen($s2) === 0) return strlen($s1);
        
        // PHP has built-in levenshtein function
        return levenshtein($s1, $s2);
    }
    
    /**
     * Search for food in master database
     * Returns exact match, close match (typo tolerance), or null
     * 
     * @param string $food_name Food to search for
     * @param int $tolerance Maximum edit distance (default 2 for typos)
     * @return array|null Food record or null if not found
     */
    public function searchFood($food_name, $tolerance = 2) {
        $search_term = trim($food_name);
        
        if (strlen($search_term) < 2) {
            return null;
        }
        
        // Step 1: Try exact match (case-insensitive)
        $this->db->prepare("
            SELECT id, food_name, emoji, category 
            FROM foods_master 
            WHERE LOWER(food_name) = LOWER(?)
            LIMIT 1
        ")
            ->bind([['type' => 's', 'value' => $search_term]])
            ->execute();
        
        $exact_match = $this->db->fetch();
        if ($exact_match) {
            error_log('DEBUG: Exact food match found: ' . $exact_match['food_name']);
            return $exact_match;
        }
        
        // Step 2: Check alternative names (common typos/variations)
        // Example: "strawberrys" matches alternative_names "strawberry,strawberries,strawbs"
        $this->db->prepare("
            SELECT id, food_name, emoji, category, alternative_names
            FROM foods_master 
            WHERE LOWER(alternative_names) LIKE LOWER(?)
            LIMIT 1
        ")
            ->bind([['type' => 's', 'value' => '%' . $search_term . '%']])
            ->execute();
        
        $alt_match = $this->db->fetch();
        if ($alt_match) {
            error_log('DEBUG: Food match found via alternative names: ' . $alt_match['food_name']);
            return [
                'id' => $alt_match['id'],
                'food_name' => $alt_match['food_name'],
                'emoji' => $alt_match['emoji'],
                'category' => $alt_match['category'],
                'matched_via' => 'alternative_names'
            ];
        }
        
        // Step 3: Fuzzy matching (Levenshtein distance)
        // Get all foods and calculate distances
        $this->db->prepare("
            SELECT id, food_name, emoji, category
            FROM foods_master
            ORDER BY food_name
        ")->execute();
        
        $all_foods = $this->db->fetchAll();
        
        $closest_matches = [];
        foreach ($all_foods as $food) {
            $distance = $this->levenshteinDistance($search_term, $food['food_name']);
            
            // Only include matches within tolerance
            if ($distance <= $tolerance) {
                $closest_matches[] = [
                    'distance' => $distance,
                    'food' => $food
                ];
            }
        }
        
        // Sort by distance (closest first)
        usort($closest_matches, function($a, $b) {
            return $a['distance'] - $b['distance'];
        });
        
        if (!empty($closest_matches)) {
            $best = $closest_matches[0]['food'];
            error_log('DEBUG: Fuzzy match found: ' . $best['food_name'] . ' (distance: ' . $closest_matches[0]['distance'] . ')');
            return [
                'id' => $best['id'],
                'food_name' => $best['food_name'],
                'emoji' => $best['emoji'],
                'category' => $best['category'],
                'matched_via' => 'fuzzy_match',
                'confidence' => 'medium'  // Less confident than exact match
            ];
        }
        
        // No match found
        error_log('DEBUG: No food match found for: ' . $search_term);
        return null;
    }
    
    /**
     * Save a new food to the master database
     * Used when Claude AI suggests a new food or parent adds custom food
     * 
     * @param string $food_name Official food name
     * @param string $emoji Food emoji
     * @param string $category Food category
     * @param string $alternative_names Comma-separated alternative names
     * @return int|false ID of inserted record or false if error
     */
    public function saveFood($food_name, $emoji, $category, $alternative_names = null) {
        try {
            // Check if already exists
            $this->db->prepare("SELECT id FROM foods_master WHERE LOWER(food_name) = LOWER(?)")
                ->bind([['type' => 's', 'value' => $food_name]])
                ->execute();
            
            if ($this->db->fetch()) {
                error_log('DEBUG: Food already exists: ' . $food_name);
                return false;  // Already exists
            }
            
            // Insert new food
            $this->db->prepare("
                INSERT INTO foods_master (food_name, emoji, category, alternative_names)
                VALUES (?, ?, ?, ?)
            ")
                ->bind([
                    ['type' => 's', 'value' => $food_name],
                    ['type' => 's', 'value' => $emoji],
                    ['type' => 's', 'value' => $category],
                    ['type' => 's', 'value' => $alternative_names]
                ])
                ->execute();
            
            $id = $this->db->getLastId();
            error_log('DEBUG: Saved new food to master DB: ' . $food_name . ' (ID: ' . $id . ')');
            return $id;
        } catch (Exception $e) {
            error_log('ERROR: Failed to save food: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get all foods in a category
     * Useful for displaying category options
     * 
     * @param string $category Category name
     * @return array Foods in that category
     */
    public function getFoodsByCategory($category) {
        $this->db->prepare("
            SELECT food_name, emoji, category
            FROM foods_master
            WHERE category = ?
            ORDER BY food_name
        ")
            ->bind([['type' => 's', 'value' => $category]])
            ->execute();
        
        return $this->db->fetchAll();
    }
    
    /**
     * Get all unique categories
     * 
     * @return array List of categories
     */
    public function getAllCategories() {
        $this->db->prepare("
            SELECT DISTINCT category
            FROM foods_master
            ORDER BY category
        ")->execute();
        
        $results = $this->db->fetchAll();
        return array_map(function($row) { return $row['category']; }, $results);
    }
}
?>
