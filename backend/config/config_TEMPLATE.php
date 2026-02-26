<?php
// ============================================
// NutraKids Configuration
// ============================================

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');           // Empty if no password
define('DB_NAME', 'nutrakids');
define('DB_PORT', 3306);

// ============================================
// Claude API Configuration
// ============================================
// Get your API key from: https://console.anthropic.com/
// 
// IMPORTANT: Replace 'sk-ant-YOUR_KEY_HERE' with your ACTUAL key
// The key should start with: sk-ant-
//
// Example (NOT A REAL KEY):
// define('CLAUDE_API_KEY', 'sk-ant-abc123xyz456...');
//
define('CLAUDE_API_KEY', 'sk-ant-YOUR_KEY_HERE');

define('CLAUDE_MODEL', 'claude-opus-4-5-20251101');
define('CLAUDE_API_URL', 'https://api.anthropic.com/v1/messages');

// ============================================
// Application Settings
// ============================================
define('APP_NAME', 'NutraKids');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development');      // Change to 'production' when live
define('SESSION_TIMEOUT', 3600);        // 1 hour
define('PASSWORD_MIN_LENGTH', 8);

// ============================================
// Error Handling
// ============================================
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 0);       // Don't display errors (log instead)
    ini_set('log_errors', 1);           // Log errors to file
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// ============================================
// Session Management
// ============================================
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
