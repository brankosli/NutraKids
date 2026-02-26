# 🔧 Backend - Shared API & Database

This is the **shared backend** used by both parent and child applications.

---

## 📁 Structure

```
backend/
├── api/
│   └── index.php              ← Main API router (all endpoints)
├── config/
│   ├── config_TEMPLATE.php    ← Copy this to config.php
│   └── config.php             ← Your configuration
├── includes/
│   ├── Database.php           ← Database wrapper class
│   ├── FoodSearch.php         ← Fuzzy matching for foods
│   └── ClaudeAIService.php    ← Claude AI integration
├── database/
│   ├── nutrakids.sql          ← Database schema (import this!)
│   └── migrations/            ← Database updates
├── logs/
│   ├── error.log              ← Error logs
│   └── debug.log              ← Debug logs
├── sessions/                  ← PHP sessions
└── uploads/                   ← User uploads
```

---

## 🚀 Setup

### **Step 1: Create Database**

```bash
# Create new MySQL database
mysql -u root -p
CREATE DATABASE nutrakids;
EXIT;

# Import schema
mysql -u root -p nutrakids < backend/database/nutrakids.sql
```

### **Step 2: Configure Database**

```bash
cd backend/config

# Copy template
cp config_TEMPLATE.php config.php

# Edit with your credentials
nano config.php
```

**Edit these values:**
```php
define('DB_HOST', 'localhost');     // Your MySQL host
define('DB_USER', 'root');          // Your MySQL user
define('DB_PASSWORD', 'password');  // Your MySQL password
define('DB_NAME', 'nutrakids');     // Database name
```

### **Step 3: Configure Claude AI (Optional)**

```php
define('CLAUDE_API_KEY', 'your-api-key-here');
define('CLAUDE_MODEL', 'claude-sonnet-4-20250514');
```

**Get API key from:** https://console.anthropic.com/

### **Step 4: Set Permissions**

```bash
# Make directories writable
chmod 755 backend/logs
chmod 755 backend/sessions
chmod 755 backend/uploads

# Optional: More permissive (less secure)
chmod 777 backend/logs
chmod 777 backend/sessions
chmod 777 backend/uploads
```

---

## 🗄️ Database

### **Tables Overview** (37 total)

**Core:**
- `users` - Parents and children accounts
- `households` - Family groups
- `household_members` - User-household relationships

**Profiles:**
- `child_profiles` - Child-specific information
- `user_settings` - User preferences

**Foods:**
- `foods` - Household foods (filtered, personal)
- `foods_master` - Global food database (130+ foods, AI-controlled)
- `food_preferences` - Child food ratings

**Meals:**
- `logged_meals` - Meals logged by children
- `planned_meals` - Meal plans

**Gamification:**
- `achievements` - Achievement definitions
- `child_achievements` - Earned achievements

**API:**
- `ai_requests` - Claude API usage tracking

---

## 📡 API Endpoints

### **Authentication**
```
GET  /api/index.php?action=auth_check
POST /api/index.php?action=parent_login
POST /api/index.php?action=logout
```

### **Children**
```
GET  /api/index.php?action=get_children
POST /api/index.php?action=create_child_profile
GET  /api/index.php?action=get_child_stats
```

### **Foods**
```
GET  /api/index.php?action=get_household_foods
POST /api/index.php?action=add_food
POST /api/index.php?action=delete_food
POST /api/index.php?action=suggest_food (Claude AI)
```

### **Food Preferences**
```
GET  /api/index.php?action=get_food_preferences
POST /api/index.php?action=save_food_preferences
```

### **Meals**
```
GET  /api/index.php?action=get_meals
POST /api/index.php?action=log_meal
```

### **Achievements**
```
GET  /api/index.php?action=get_achievements
```

---

## 🔑 Test Accounts

### **Parent Account**
```
Email: parent@test.com
Password: soccer10
```

### **Create Child Account**

Run this SQL:
```sql
INSERT INTO users (email, password, first_name, last_name, user_type)
VALUES (
    'johnny@family.com',
    '$2y$10$...',  -- bcrypt hash
    'Johnny',
    'Smith',
    'child'
);
```

---

## 📝 Important Files

### **Configuration**
- `backend/config/config.php` - Database & API settings

### **API Router**
- `backend/api/index.php` - All endpoints (1000+ lines)

### **Database Classes**
- `backend/includes/Database.php` - Database wrapper
- `backend/includes/FoodSearch.php` - Fuzzy matching
- `backend/includes/ClaudeAIService.php` - Claude integration

### **Database**
- `backend/database/nutrakids.sql` - Schema

---

## 🔍 Debugging

### **Enable Error Logging**

```php
// In api/index.php at top
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

### **Check Logs**

```bash
# View recent errors
tail -f backend/logs/error.log

# View debug logs
tail -f backend/logs/debug.log
```

### **Test API**

```bash
# Using curl
curl http://localhost/NutraKids-Monorepo/backend/api/index.php?action=auth_check

# Should return: {"authenticated": false}
```

---

## 🔐 Security Notes

1. **Keep config.php private** - Don't commit to git
2. **Use strong passwords** - For database and API keys
3. **Validate input** - All endpoints validate input
4. **Use HTTPS** - In production
5. **Hide errors** - Set `display_errors = 0` in production

---

## 🚀 Deployment

### **Local Development**
```
API: http://localhost/NutraKids-Monorepo/backend/api/index.php
```

### **Production (Example)**
```
API: https://api.nutrakids.com/backend/api/index.php
```

**Server Requirements:**
- PHP 7.4+
- MySQL 5.7+
- cURL enabled
- SSL certificate (HTTPS)

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| "Database connection failed" | Check config.php credentials |
| "CORS error" | Add headers in api/index.php |
| "Claude API error" | Check API key in config.php |
| "File not found" | Check relative paths |
| "Permission denied" | Run chmod 777 on logs/sessions |

---

## 📚 Related Files

- `/README.md` - Main project overview
- `../parent-app/public/js/app.js` - Calls API endpoints
- `../child-app/public/js/app.js` - Calls API endpoints
- `../docs/` - Full documentation

---

**The backend is ready to power both apps!** 🚀
