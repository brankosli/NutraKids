# 🚀 Child App V1 - Complete Implementation Guide

**Status:** Ready to Deploy  
**Version:** 1.0  
**Date:** Feb 25, 2026

---

## 📋 FILES PROVIDED

You have 4 files to integrate into your project:

1. **child-app-index.html** → `child-app/public/index.html`
2. **child-app-styles.css** → `child-app/public/css/styles.css`
3. **child-app-app.js** → `child-app/public/js/app.js`
4. **MONOREPO_ARCHITECTURE.md** → Documentation

---

## 🏗️ STEP 1: Create Monorepo Structure

### **Current Structure (Parent App)**
```
NutraKids-App/
├── api/
├── config/
├── database/
├── includes/
├── logs/
├── public/          ← Parent app (rename this)
├── sessions/
└── uploads/
```

### **New Structure (Monorepo)**
```
NutraKids-App/
│
├── backend/                 ← NEW FOLDER (move shared files here)
│   ├── api/                (move from root)
│   ├── config/             (move from root)
│   ├── database/           (move from root)
│   ├── includes/           (move from root)
│   ├── logs/               (move from root)
│   └── sessions/           (move from root)
│
├── parent-app/              ← NEW FOLDER (parent app)
│   └── public/             (move current public here)
│       ├── index.html
│       ├── css/
│       ├── js/
│       └── ...
│
├── child-app/               ← NEW FOLDER (child app)
│   └── public/
│       ├── index.html      (use child-app-index.html)
│       ├── css/
│       │   └── styles.css  (use child-app-styles.css)
│       └── js/
│           └── app.js      (use child-app-app.js)
│
└── docs/                    ← NEW FOLDER (documentation)
    └── MONOREPO_ARCHITECTURE.md
```

---

## 🔧 STEP 2: Reorganize Files

### **2a. Create Backend Folder**
```bash
mkdir -p NutraKids-App/backend
```

### **2b. Move Shared Backend to Backend Folder**
```bash
cd NutraKids-App

# Move backend files
mv api backend/
mv config backend/
mv database backend/
mv includes backend/
mv logs backend/
mv sessions backend/
mv uploads backend/

# Verify
ls backend/
# Should show: api config database includes logs sessions uploads
```

### **2c. Create Parent App Folder**
```bash
mkdir -p parent-app/public

# Move current public folder to parent-app
mv public/* parent-app/public/

# Remove empty public folder
rmdir public
```

### **2d. Create Child App Folder**
```bash
mkdir -p child-app/public/css
mkdir -p child-app/public/js

# Copy files (use the ones we created)
cp child-app-index.html child-app/public/index.html
cp child-app-styles.css child-app/public/css/styles.css
cp child-app-app.js child-app/public/js/app.js
```

### **2e. Create Docs Folder**
```bash
mkdir -p docs
cp MONOREPO_ARCHITECTURE.md docs/
```

### **2f. Final Structure Check**
```bash
tree -L 2
# Should show the monorepo structure
```

---

## 🔗 STEP 3: Update Relative Paths

Both apps need to call the backend API correctly now!

### **Parent App - Update Relative Paths**

**File:** `parent-app/public/js/app.js`

Find all API calls and update them:

```javascript
// OLD (before monorepo)
fetch('../api/index.php?action=...')

// NEW (monorepo structure)
fetch('../../../backend/api/index.php?action=...')
```

**Find & Replace Pattern:**
```javascript
// Search for:
fetch('../api/
// Replace with:
fetch('../../../backend/api/
```

**Count of changes needed:** ~15-20 API calls

### **Child App - Already Correct!**
The child app we created already uses:
```javascript
fetch('../../../api/index.php?action=...')
```

But we need to update it to use `/backend/`:

**File:** `child-app/public/js/app.js`

Find and update:
```javascript
// Current (incorrect)
fetch('../../../api/index.php?action=...')

// Should be (correct for monorepo)
fetch('../../../backend/api/index.php?action=...')
```

Actually, let me provide the corrected file...

---

## 🔧 STEP 4: Update Backend Config Paths

Some PHP files might have hardcoded paths. Check:

**File:** `backend/api/index.php`

```php
// At the top, should have:
require_once '../includes/Database.php';
require_once '../includes/ClaudeAIService.php';
require_once '../includes/FoodSearch.php';
require_once '../config/config.php';

// These are still correct since api is in backend/api
```

**File:** `backend/config/config.php`

Check database connection - should work as-is if all moved together.

---

## ✅ STEP 5: Test Both Apps

### **Test Parent App**
```bash
Open: http://localhost/NutraKids-App/parent-app/public/
Login: parent@test.com / soccer10
✅ Should see parent dashboard
```

### **Test Child App**
```bash
Open: http://localhost/NutraKids-App/child-app/public/
Login: child@family.com / childpassword (or use child credentials from your DB)
✅ Should see child dashboard
```

### **Check API Calls**
```bash
Open browser DevTools (F12)
Go to Network tab
Try to log in
Check if API calls go to: /NutraKids-App/backend/api/index.php
✅ Should see successful responses
```

---

## 📝 IMPORTANT: Database & Child Accounts

### **Create Child Account for Testing**

Run this SQL to create a test child account:

```sql
INSERT INTO users (email, password, first_name, last_name, user_type, created_at)
VALUES (
    'johnny@family.com',
    '$2y$10$...hash...',  -- Use bcrypt hash
    'Johnny',
    'Smith',
    'child',
    NOW()
);
```

**To create a proper password hash in PHP:**

```php
<?php
$password = 'johnny123';
$hash = password_hash($password, PASSWORD_BCRYPT);
echo $hash;
?>
```

Or use the included password generator:
```bash
php backend/public/generate_password.php
```

### **Verify Child Account**
```sql
SELECT * FROM users WHERE user_type = 'child';
```

---

## 🔑 STEP 6: Update App.js Relative Paths

**Critical Step!** Both apps need correct paths to backend:

### **For Parent App**

**File:** `parent-app/public/js/app.js`

Update ALL instances of `../api/` to `../../../backend/api/`:

```javascript
// BEFORE (won't work in monorepo)
fetch('../api/index.php?action=auth_check')
fetch('../api/index.php?action=parent_login')
fetch('../api/index.php?action=get_children')

// AFTER (correct for monorepo)
fetch('../../../backend/api/index.php?action=auth_check')
fetch('../../../backend/api/index.php?action=parent_login')
fetch('../../../backend/api/index.php?action=get_children')
```

**Quick way to find all:**
```bash
grep -n "../api/" parent-app/public/js/app.js
# Will show all lines that need updating
```

### **For Child App**

**File:** `child-app/public/js/app.js`

Already has the structure but check:
```javascript
// Look for all instances of:
fetch('../../../api/index.php?action=...')

// These should actually be:
fetch('../../../backend/api/index.php?action=...')
```

---

## 🚀 STEP 7: Local Testing Checklist

- [ ] All files copied to correct locations
- [ ] Relative paths updated in JavaScript files
- [ ] Backend folder created with all shared files
- [ ] Parent app loads at: http://localhost/NutraKids-App/parent-app/public/
- [ ] Child app loads at: http://localhost/NutraKids-App/child-app/public/
- [ ] Parent login works
- [ ] Child login works
- [ ] Both apps can call API endpoints
- [ ] Network requests show `/backend/api/` paths

---

## 📱 TESTING CREDENTIALS

### **Parent Account**
```
Email: parent@test.com
Password: soccer10
```

### **Child Account** (Create if not exists)
```
Email: johnny@family.com
Password: johnny123 (or whatever you set)
```

---

## 🐛 Troubleshooting

### **"API endpoint not found" Error**
**Problem:** Relative paths wrong
**Solution:** Check all `fetch()` calls use `../../../backend/api/index.php`

### **"Cannot connect to database" Error**
**Problem:** Config.php path wrong
**Solution:** Verify `backend/config/config.php` exists and api/index.php requires it

### **404 on public folder**
**Problem:** Old path still referenced
**Solution:** Make sure you access `parent-app/public/` not just `public/`

### **Child app shows blank screen**
**Problem:** JavaScript error
**Solution:** Open DevTools (F12) → Console and check for errors

---

## 📊 Production Deployment

### **Same Server, Same Domain**
```
Deploy to: /var/www/html/nutrakids/
Structure automatically works:
- Parent: domain.com/nutrakids/parent-app/public/
- Child: domain.com/nutrakids/child-app/public/
- API: domain.com/nutrakids/backend/api/index.php
```

### **Different Servers**
```
Server 1 (API):
- /var/www/nutrakids-api/backend/api/
- /var/www/nutrakids-api/backend/config/

Server 2 (Parent App):
- /var/www/nutrakids-parent/parent-app/public/

Server 3 (Child App):
- /var/www/nutrakids-child/child-app/public/

Apps call: https://api.nutrakids.com/backend/api/index.php
```

---

## 🎯 Next Steps

1. ✅ Create monorepo structure
2. ✅ Move files to correct locations
3. ✅ Update relative paths
4. ✅ Test both apps locally
5. ✅ Create test child account
6. ✅ Verify API calls work
7. ⏭️ Deploy to production

---

## 📚 Additional Resources

- `MONOREPO_ARCHITECTURE.md` - Architecture overview
- `API.md` - API endpoint documentation (if available)
- Parent app code - See parent-app/public/js/app.js
- Child app code - See child-app/public/js/app.js

---

## ✨ You're Ready!

The monorepo structure is designed to support:
- ✅ Web apps (current)
- ✅ Mobile apps (future - different frontend, same backend)
- ✅ Scaling (easy to deploy separately)
- ✅ Maintenance (code organization)

**Start the implementation and let me know if you hit any issues!** 🚀
