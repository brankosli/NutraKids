# 👧 Child App - Kid-Friendly Experience

The **child interface** for logging meals and tracking achievements.

---

## 🎯 Features

- ✅ Child authentication
- ✅ Colorful dashboard
- ✅ Meal logging with emoji ratings
- ✅ Today's stats & challenges
- ✅ Achievement badges
- ✅ Food preferences view
- ✅ Meal history
- ✅ Success celebrations
- ✅ Mobile responsive
- ✅ Fun, engaging design

---

## 📁 Structure

```
child-app/public/
├── index.html          ← All child screens
├── css/
│   └── styles.css      ← Kid-friendly styling
└── js/
    └── app.js          ← Child logic
```

---

## 🚀 Access

```
URL: http://localhost/NutraKids-Monorepo/child-app/public/
```

---

## 🔐 Login

```
Email: (created by parent)
Password: (set by parent)

Example:
Email: johnny@family.com
Password: johnny123
```

---

## 📱 Screens

### **1. Login Screen**
- Kid-friendly welcome message
- Email and password input
- Fun, colorful design
- Error messages

### **2. Dashboard**
- **Welcome Greeting** - "Hi [Name]! 🌟"
- **Daily Challenge** - Fun challenge with bonus points
- **Quick Actions** - 6 big buttons:
  - 🍽️ Log a Meal
  - 📊 Today's Stats
  - 🏆 Achievements
  - ❤️ My Favorites
  - 📜 Meal History
  - ℹ️ About

### **3. Log Meal**
- Meal name input
- Meal type selector (breakfast/lunch/dinner/snack)
- **Emoji Rating System** (5 options):
  - 😢 (1 star)
  - 😐 (2 stars)
  - 🙂 (3 stars)
  - 😊 (4 stars)
  - 😍 (5 stars)
- Save button
- Success celebration modal

### **4. Today's Stats**
- Meals logged count
- Points earned today
- List of meals with ratings
- Visual progress
- Celebration message

### **5. Achievements**
- Achievement badges
- Emoji icons
- Achievement names
- Description text
- Achievement progress

### **6. My Favorites**
- Foods with ratings
- Visual star display
- Organized by type
- Beautiful cards

### **7. Meal History**
- Meals grouped by date
- Chronological order
- Show time logged
- Show rating
- Complete history

---

## 🎨 Design

- **Color Scheme:**
  - 🔴 Primary Red: #FF6B6B
  - 🟦 Turquoise: #4ECDC4
  - 🟨 Sunny Yellow: #FFE66D
  - 🟩 Mint Green: #95E1D3

- **Typography:**
  - Large fonts (18px minimum)
  - Clear, readable
  - Kid-friendly language

- **Buttons:**
  - Large (44px+ touch targets)
  - Colorful gradients
  - Hover animations
  - Visual feedback

- **Responsive:**
  - Mobile-first
  - Tablet optimized
  - Desktop support
  - Landscape/Portrait

---

## 🔗 API Integration

**Calls these endpoints:**

```javascript
// Authentication
fetch('../../../backend/api/index.php?action=auth_check')
fetch('../../../backend/api/index.php?action=parent_login')
fetch('../../../backend/api/index.php?action=logout')

// Meals
fetch('../../../backend/api/index.php?action=log_meal')
fetch('../../../backend/api/index.php?action=get_meals')

// Achievements
fetch('../../../backend/api/index.php?action=get_achievements')

// Preferences & Foods
fetch('../../../backend/api/index.php?action=get_food_preferences')
fetch('../../../backend/api/index.php?action=get_household_foods')
```

---

## 📝 Key Functions

### **Authentication**
```javascript
checkAuth()              // Check if logged in
handleChildLogin()       // Process login
handleLogout()           // Process logout
```

### **Dashboard**
```javascript
loadChildDashboard()     // Load all data
generateDailyChallenge() // Create random challenge
loadTodayStats()         // Get today's data
```

### **Meal Logging**
```javascript
handleLogMeal()          // Save meal to DB
setRating()              // Set emoji rating
showSuccessModal()       // Celebration
```

### **Data Loading**
```javascript
loadMeals()              // Get meal history
loadAchievements()       // Get achievements
loadFoodPreferences()    // Get favorite foods
```

### **Display Updates**
```javascript
renderAchievements()     // Show badges
renderFoodPreferences()  // Show favorites
loadMealHistory()        // Show history
updateDetailedStats()    // Show stats
```

---

## 🧪 Testing

### **Test Child Functions**

1. **Login**
   - Go to login screen
   - Enter child credentials
   - Should load dashboard

2. **Log Meal**
   - Click "Log a Meal"
   - Enter meal name
   - Select meal type
   - Click emoji rating
   - Click "Save Meal"
   - Should see celebration

3. **View Stats**
   - Click "Today's Stats"
   - Should show meals logged
   - Should show points earned

4. **View Achievements**
   - Click "Achievements"
   - Should show earned badges

5. **View Favorites**
   - Click "My Favorites"
   - Should show food ratings

6. **View History**
   - Click "Meal History"
   - Should show all meals
   - Grouped by date

---

## 🎯 User Experience

### **For a 10-Year-Old**
- ✅ Login is simple
- ✅ 6 main buttons (not overwhelming)
- ✅ Meal logging is fun (emoji ratings)
- ✅ Achievements are exciting (badges)
- ✅ Stats are clear (numbers + icons)
- ✅ No technical language
- ✅ Lots of encouragement

### **Design Considerations**
- Large touch targets (kids have smaller hands on tablets)
- Colorful, engaging interface
- Immediate feedback (success modals)
- Fun emojis throughout
- Clear navigation
- Simple language
- Mobile-first (kids use tablets)

---

## 📊 Data Flow

```
Child Action (Log Meal)
    ↓
Click Button
    ↓
JavaScript Handler (handleLogMeal)
    ↓
Validate Input
    ↓
Fetch to Backend API
    ↓
INSERT into logged_meals
    ↓
Return Success
    ↓
Show Success Modal
    ↓
Reload Data
    ↓
Return to Dashboard
```

---

## 🎨 Responsive Design

### **Mobile (< 480px)**
- Stacked layout
- Full-width buttons
- Large fonts
- Portrait optimized

### **Tablet (480px - 768px)**
- 2-column grid
- Touch-friendly buttons
- Medium fonts
- Both orientations

### **Desktop (> 768px)**
- 3-column grid
- Mouse-friendly
- Normal fonts
- Centered content

---

## 💡 Key Notes

1. **Success Celebrations:** Shows modal after logging meal
2. **Emoji Ratings:** 5 options from 😢 to 😍
3. **Daily Challenges:** Random challenge each day
4. **Auto-Return:** Goes back to dashboard after 2 seconds
5. **Progress Tracking:** Shows meals + points instantly

---

## 🐛 Debugging

### **Check Console**
```
F12 → Console tab
Look for messages
Check for errors
```

### **Check Login**
```
Make sure child account exists in DB
Verify email matches exactly
Verify user_type = 'child'
```

### **Check API Calls**
```
F12 → Network tab
Verify calls go to /backend/api/
Check response status (200 = success)
```

---

## 🚀 Deployment

### **Local**
```
URL: http://localhost/NutraKids-Monorepo/child-app/public/
```

### **Production**
```
URL: https://nutrakids.com/child-app/public/
API: https://nutrakids.com/backend/api/index.php
(All relative paths remain the same)
```

---

## 📖 Related Documentation

- `/README.md` - Main project overview
- `../backend/README.md` - API documentation
- `../parent-app/` - Parent app
- `../docs/` - Full documentation

---

## ✨ You Have Everything!

The child app is **fully functional** and ready to:
- Let kids login
- Log their meals
- Rate with fun emojis
- View achievements
- See their progress
- Have fun while eating healthy!

**Start the backend, then access the child app!** 🚀

---

**This app makes healthy eating FUN for kids!** 🥗🌟
