# 👨‍👩‍👧 Parent App - Control & Management

The **parent interface** for managing the family's nutrition app.

---

## 🎯 Features

- ✅ Parent authentication
- ✅ Household management
- ✅ Child profile creation
- ✅ Food database management
- ✅ AI-powered food suggestions
- ✅ Food preference setup
- ✅ Meal history tracking
- ✅ Children progress overview
- ✅ Achievement management

---

## 📁 Structure

```
parent-app/public/
├── index.html          ← All parent screens
├── css/
│   └── styles.css      ← Parent styling
└── js/
    └── app.js          ← Parent logic
```

---

## 🚀 Access

```
URL: http://localhost/NutraKids-Monorepo/parent-app/public/
```

---

## 🔐 Login

```
Email: parent@test.com
Password: soccer10
```

---

## 📱 Screens

### **1. Login Screen**
- Email and password input
- Session management
- Error handling

### **2. Parent Dashboard**
- Welcome message
- Children list
- Add child button
- Recent activity
- Manage foods button

### **3. Child Profile Creation**
- Child name and age
- Allergies selection
- Health goals
- Initial food preferences

### **4. Food Management**
- View household foods (organized by category)
- Add new foods
- AI-powered food suggestions
- Delete foods
- Duplicate prevention

### **5. Child Selection**
- View all children
- Click to view child details
- See their progress

### **6. Child Dashboard (Parent view)**
- Child name and stats
- Meals logged
- Achievements earned
- Food preferences set
- Back to parent dashboard

---

## 🎨 Design

- **Color Scheme:** Green (#4CAF50)
- **Style:** Professional, clean
- **Responsive:** Desktop-first
- **Approach:** Management-focused

---

## 🔗 API Integration

**Calls these endpoints:**

```javascript
// Authentication
fetch('../../../backend/api/index.php?action=auth_check')
fetch('../../../backend/api/index.php?action=parent_login')
fetch('../../../backend/api/index.php?action=logout')

// Children
fetch('../../../backend/api/index.php?action=get_children')
fetch('../../../backend/api/index.php?action=create_child_profile')

// Foods
fetch('../../../backend/api/index.php?action=get_household_foods')
fetch('../../../backend/api/index.php?action=add_food')
fetch('../../../backend/api/index.php?action=delete_food')
fetch('../../../backend/api/index.php?action=suggest_food')

// Preferences
fetch('../../../backend/api/index.php?action=save_food_preferences')
fetch('../../../backend/api/index.php?action=get_food_preferences')
```

---

## 📝 Key Functions

### **Authentication**
```javascript
checkAuth()              // Check if logged in
handleLogin()            // Process login
handleLogout()           // Process logout
```

### **Children**
```javascript
loadChildren()           // Get all children
loadChildDashboard()     // View child details
```

### **Foods**
```javascript
loadFoods()              // Get household foods
suggestFood()            // AI suggestion
confirmFood()            // Add food
deleteFood()             // Remove food
```

### **Preferences**
```javascript
completeQuestionnaire()  // Save food preferences
showFoodPreferences()    // View preferences
editFoodPreference()     // Parent editing
```

---

## 🧪 Testing

### **Test Parent Functions**

1. **Login**
   - Go to login screen
   - Enter: parent@test.com / soccer10
   - Should load parent dashboard

2. **Create Child**
   - Click "Add Child"
   - Fill form
   - Set food preferences
   - Should appear in children list

3. **Manage Foods**
   - Click "Manage Foods"
   - View foods by category
   - Add new food (with AI suggestion)
   - Delete food
   - Check for duplicates

4. **Food Preferences**
   - Select child
   - Click "View Food Preferences"
   - Should show questionnaire
   - Parent can edit ratings

---

## 🔄 Data Flow

```
User Action (Click button)
    ↓
JavaScript Handler (handleLogin, etc.)
    ↓
Fetch to Backend API
    ↓
backend/api/index.php
    ↓
Database Query
    ↓
Return JSON Response
    ↓
Update UI / Show Data
    ↓
User Sees Result
```

---

## 🐛 Debugging

### **Check Console**
```
F12 → Console tab
Look for error messages
Check network requests
```

### **Check Network**
```
F12 → Network tab
Click action to trigger
Check API calls
Verify responses (200 = success)
```

### **Enable Debug Logging**
```javascript
// In app.js, debug logging is already enabled
// Check console for: "Loading...", "✅ Success", "❌ Error"
```

---

## 📚 Code Structure

### **app.js Overview**
- **Lines 1-50:** Initialization & setup
- **Lines 51-200:** Authentication
- **Lines 201-400:** Children management
- **Lines 401-600:** Food management
- **Lines 601-800:** Preferences & UI updates
- **Lines 801-1200+:** Helper functions

---

## 🎯 Important Notes

1. **API Paths:** Updated to use `../../../backend/api/`
2. **Relative Paths:** All work correctly in monorepo
3. **Session Cookies:** Enabled by default
4. **Error Handling:** All endpoints have try-catch
5. **Loading States:** Shows feedback to user

---

## 🚀 Deployment

### **Local**
```
URL: http://localhost/NutraKids-Monorepo/parent-app/public/
```

### **Production**
```
URL: https://nutrakids.com/parent-app/public/
API: https://nutrakids.com/backend/api/index.php
(All relative paths remain the same)
```

---

## 📖 Related Documentation

- `/README.md` - Main project overview
- `../backend/README.md` - API documentation
- `../child-app/` - Child app
- `../docs/` - Full documentation

---

## ✨ You Have Everything!

The parent app is **fully functional** and ready to:
- Manage families
- Create children
- Control food database
- Set preferences
- Track progress

**Start the backend, then access the parent app!** 🚀
