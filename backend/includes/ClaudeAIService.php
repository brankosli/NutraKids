<?php
class ClaudeAIService {
    private $apiKey;
    private $apiUrl;
    private $model;

    public function __construct() {
        $this->apiKey = CLAUDE_API_KEY;
        $this->apiUrl = CLAUDE_API_URL;
        $this->model = CLAUDE_MODEL;
    }

    public function generateMealPlan($childProfile, $foodPreferences) {
        $likes = [];
        $dislikes = [];
        foreach ($foodPreferences as $pref) {
            if ($pref['rating'] >= 4) {
                $likes[] = $pref['food_name'];
            } elseif ($pref['rating'] <= 2) {
                $dislikes[] = $pref['food_name'];
            }
        }
        $prompt = $this->buildMealPlanPrompt($childProfile, $likes, $dislikes);
        return $this->callClaudeAPI($prompt, 'meal_plan_generation');
    }

    private function buildMealPlanPrompt($childProfile, $likes, $dislikes) {
        $dailyCalories = $childProfile['daily_calorie_target'] ?? DEFAULT_DAILY_CALORIES;
        $healthGoals = $childProfile['health_goals'] ?? 'balanced nutrition';
        $prepTime = $childProfile['preferred_meal_prep_time'] ?? 30;

        return "Generate a 7-day meal plan for a 12-year-old with: Likes: " . implode(', ', $likes) . 
               " Dislikes: " . implode(', ', $dislikes) . " Daily calories: $dailyCalories Prep time: ${prepTime}min";
    }

    private function callClaudeAPI($prompt, $requestType) {
        $data = [
            'model' => $this->model,
            'max_tokens' => 2048,
            'messages' => [['role' => 'user', 'content' => $prompt]]
        ];

        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-api-key: ' . $this->apiKey
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            return ['success' => false, 'error' => 'API Error'];
        }

        $result = json_decode($response, true);
        if (isset($result['content'][0]['text'])) {
            return ['success' => true, 'data' => $result['content'][0]['text']];
        }
        return ['success' => false, 'error' => 'Unexpected response'];
    }
}
?>
