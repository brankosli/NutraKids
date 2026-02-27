// ============================================
// 🥗 NutraKids - Child App V1.1
// Simplified meal logging + gamification
// ============================================

console.log('=== NutraKids Child App V1.1 Starting ===');

// ============================================
// APP STATE
// ============================================

const appState = {
    currentUser: null,
    currentChild: null,
    meals: [],
    foods: [],
    achievements: [],
    selectedRating: 0,
    selectedFood: null,
    selectedMealType: 'breakfast',
    totalPoints: 0,
    todayPoints: 0,
    waterToday: 0
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing child app...');
    setupEventListeners();
    checkAuth();
});

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleChildLogin);
    }
    
    const foodSearch = document.getElementById('foodSearch');
    if (foodSearch) {
        foodSearch.addEventListener('input', handleFoodSearch);
    }
    
    const childLogoutBtn = document.getElementById('childLogoutBtn');
    if (childLogoutBtn) {
        childLogoutBtn.addEventListener('click', handleLogout);
    }
    
    console.log('✅ Event listeners setup complete');
}

// ============================================
// AUTHENTICATION
// ============================================

function checkAuth() {
    console.log('🔍 Checking authentication...');
    
    fetch('../../backend/api/index.php?action=auth_check', {
        method: 'GET',
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        console.log('Auth check response:', data);
        if (data.authenticated && data.user) {
            if (data.user.user_type === 'child') {
                console.log('✅ Child authenticated');
                appState.currentUser = data.user;
                appState.currentChild = data.user;
                loadChildDashboard();
            } else {
                console.log('❌ Not a child account');
                showScreen('loginScreen');
            }
        } else {
            console.log('❌ Not authenticated');
            showScreen('loginScreen');
        }
    })
    .catch(e => {
        console.error('Auth check error:', e);
        showScreen('loginScreen');
    });
}

function handleChildLogin(e) {
    e.preventDefault();
    console.log('👧 Child login initiated');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    fetch('../../backend/api/index.php?action=parent_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Login response:', data);
        
        if (data.success && data.user) {
            if (data.user.user_type === 'child') {
                console.log('✅ Child login successful');
                appState.currentUser = data.user;
                appState.currentChild = data.user;
                clearLoginErrors();
                loadChildDashboard();
            } else {
                showLoginError('❌ This is not a child account!');
            }
        } else {
            showLoginError(data.message || 'Login failed');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showLoginError('Connection error');
    });
}

function handleLogout(e) {
    if (e) e.preventDefault();
    console.log('👋 Logout initiated');
    
    fetch('../../backend/api/index.php?action=logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(() => {
        appState.currentUser = null;
        appState.currentChild = null;
        showScreen('loginScreen');
        clearLoginErrors();
    });
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }
}

function clearLoginErrors() {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }
}

// ============================================
// DASHBOARD LOADING
// ============================================

function loadChildDashboard() {
    console.log('📊 Loading child dashboard...');
    
    if (appState.currentChild?.first_name) {
        document.getElementById('childNameDisplay').textContent = appState.currentChild.first_name;
    }
    
    loadFoods();
    loadAchievements();
    
    loadMeals().then(() => {
        console.log('Meals loaded, updating dashboard...');
        updateDashboardStats();
        displayTodaysMeals();
    });
    
    loadDailyPoints();
    
    showScreen('childDashboard');
}

function updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = appState.meals.filter(m => {
        return m.meal_date === today || (m.logged_at && m.logged_at.startsWith(today));
    });
    
    document.getElementById('mealsLoggedCount').textContent = todayMeals.length;
    
    // Calculate average rating
    const ratings = todayMeals.filter(m => m.meal_rating).map(m => m.meal_rating);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(1) : '-';
    document.getElementById('avgRatingDisplay').textContent = avgRating;
}

function displayTodaysMeals() {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = appState.meals.filter(m => 
        m.meal_date === today || (m.logged_at && m.logged_at.startsWith(today))
    );
    
    const container = document.getElementById('todayMealsBreakdown');
    
    if (todayMeals.length === 0) {
        container.innerHTML = '<p class="empty-state">No foods logged yet. Start logging! 🍽️</p>';
        return;
    }
    
    // Group by meal type
    const grouped = {};
    todayMeals.forEach(meal => {
        if (!grouped[meal.meal_type]) grouped[meal.meal_type] = [];
        grouped[meal.meal_type].push(meal);
    });
    
    const icons = { breakfast: '🌅', lunch: '🌞', dinner: '🌙', snack: '🍿' };
    
    let html = '';
    for (const [type, meals] of Object.entries(grouped)) {
        html += `<div class="meal-group">
                    <h4>${icons[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}</h4>`;
        
        meals.forEach(meal => {
            html += `<div class="meal-item">
                        <div class="meal-name">${meal.meal_name}</div>
                        <div class="meal-rating">${'⭐'.repeat(meal.meal_rating)}</div>
                        <div class="meal-points">+${meal.points_earned || 10} pts</div>
                     </div>`;
        });
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function showScreen(screenId) {
    console.log('📱 Switching to screen:', screenId);
    
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('✅ Screen switched to:', screenId);
        
        if (screenId === 'todayStatsScreen') {
            loadTodayStats();
        } else if (screenId === 'achievementsScreen') {
            loadAchievements();
        } else if (screenId === 'foodPreferencesScreen') {
            loadFoodPreferences();
        }
    }
}

// ============================================
// MEAL LOGGING - SIMPLIFIED
// ============================================

function selectMealType(type) {
    appState.selectedMealType = type;
    document.getElementById('selectedMealType').value = type;
    
    // Visual feedback
    document.querySelectorAll('.meal-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    
    console.log('Meal type selected:', type);
}

function handleFoodSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const resultsDiv = document.getElementById('foodSearchResults');
    
    if (!query) {
        resultsDiv.innerHTML = '';
        return;
    }
    
    // Filter foods
    const results = appState.foods.filter(f => 
        f.name.toLowerCase().includes(query)
    ).slice(0, 8);
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">No foods found</div>';
        return;
    }
    
    const html = results.map(food => `
        <div class="search-result" onclick="selectFood({id: ${food.id}, name: '${food.name}'})">
            <span>${food.emoji || '🍽️'}</span> ${food.name}
        </div>
    `).join('');
    
    resultsDiv.innerHTML = html;
}

function selectFood(food) {
    appState.selectedFood = food;
    document.getElementById('foodSearch').value = food.name;
    document.getElementById('foodSearchResults').innerHTML = '';
    
    // Show selected food and rating section
    document.getElementById('selectedFoodDisplay').classList.remove('hidden');
    document.getElementById('selectedFoodName').textContent = food.name;
    document.getElementById('ratingSection').style.display = 'block';
    document.getElementById('actionButtons').style.display = 'block';
    
    console.log('Food selected:', food);
}

function clearFoodSelection() {
    appState.selectedFood = null;
    appState.selectedRating = 0;
    document.getElementById('foodSearch').value = '';
    document.getElementById('selectedFoodDisplay').classList.add('hidden');
    document.getElementById('ratingSection').style.display = 'none';
    document.getElementById('actionButtons').style.display = 'none';
    document.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('selected'));
}

function setRating(rating) {
    console.log('⭐ Rating set:', rating);
    appState.selectedRating = rating;
    
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.rating) === rating) {
            btn.classList.add('selected');
        }
    });
}

function handleLogFood() {
    if (!appState.selectedFood) {
        alert('Please select a food');
        return;
    }
    if (!appState.selectedRating) {
        alert('Please rate the food');
        return;
    }
    
    const childId = appState.currentChild?.user_id;
    if (!childId) {
        alert('Error: Child ID not found');
        return;
    }
    
    console.log('🍽️ Logging food:', appState.selectedFood);
    
    fetch('../../backend/api/index.php?action=log_food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            child_id: childId,
            food_id: appState.selectedFood.id,
            food_name: appState.selectedFood.name,
            meal_type: appState.selectedMealType,
            meal_rating: appState.selectedRating
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Log food response:', data);
        
        if (data.success) {
            console.log('✅ Food logged!', data);
            
            // Show success with points
            showSuccessModal(
                `🎉 ${appState.selectedFood.name} logged!\n+${data.points_earned} points!`,
                data.bonus_reason || ''
            );
            
            // Reload data
            loadMeals().then(() => {
                updateDashboardStats();
                displayTodaysMeals();
            });
            loadDailyPoints();
            
            // Reset form
            clearFoodSelection();
            document.getElementById('foodSearch').focus();
            
            // Show added foods
            displayAddedFoods();
        } else {
            alert('Error: ' + (data.message || 'Failed to log food'));
        }
    })
    .catch(error => {
        console.error('Error logging food:', error);
        alert('Connection error: ' + error.message);
    });
}

function handleContinueAdding() {
    document.getElementById('foodsAddedSection').style.display = 'none';
    document.getElementById('foodSearch').focus();
}

function displayAddedFoods() {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = appState.meals.filter(m => 
        m.meal_date === today || (m.logged_at && m.logged_at.startsWith(today))
    );
    
    if (todayMeals.length > 0) {
        const list = todayMeals.map(meal => 
            `<div class="food-added-item">✓ ${meal.meal_name} ${('⭐').repeat(meal.meal_rating)}</div>`
        ).join('');
        
        document.getElementById('foodsAddedList').innerHTML = list;
        document.getElementById('foodsAddedSection').style.display = 'block';
    }
}

// ============================================
// WATER LOGGING
// ============================================

function openWaterLogger() {
    console.log('💧 Opening water logger');
    document.getElementById('waterLoggerModal').classList.remove('hidden');
    updateWaterDisplay();
}

function closeWaterLogger() {
    document.getElementById('waterLoggerModal').classList.add('hidden');
}

function addWater(cups) {
    const childId = appState.currentChild?.user_id;
    if (!childId) {
        alert('Error: Child ID not found');
        return;
    }
    
    console.log('💧 Adding water:', cups, 'cups');
    
    fetch('../../backend/api/index.php?action=log_water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            child_id: childId,
            cups: cups
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Water log response:', data);
        
        if (data.success) {
            appState.waterToday = data.water_today;
            
            let message = `💧 Great! You drank ${cups} cup${cups > 1 ? 's' : ''}! +${data.points_earned} pts`;
            if (data.bonus) {
                message += `\n🎉 ${data.bonus}`;
            }
            
            document.getElementById('waterMessage').innerHTML = `<p>${message}</p>`;
            updateWaterDisplay();
            
            // Update dashboard water count
            document.getElementById('waterLoggedCount').textContent = appState.waterToday;
            
            // Reload points
            loadDailyPoints();
            
            // Update dashboard display
            setTimeout(() => {
                document.getElementById('totalPointsDisplay').textContent = appState.totalPoints;
                document.getElementById('todayPointsDisplay').textContent = appState.todayPoints;
            }, 300);
        } else {
            alert('Error: ' + (data.message || 'Failed to log water'));
        }
    })
    .catch(error => {
        console.error('Water logging error:', error);
        alert('Connection error');
    });
}

function updateWaterDisplay() {
    const waterFilled = document.getElementById('waterFilled');
    const waterCurrentCount = document.getElementById('waterCurrentCount');
    
    if (waterFilled && waterCurrentCount) {
        const percentage = Math.min((appState.waterToday / 8) * 100, 100);
        waterFilled.style.width = percentage + '%';
        waterCurrentCount.textContent = appState.waterToday;
        
        console.log('💧 Water display updated:', appState.waterToday, '/', 8, '=', percentage + '%');
    }
}

// ============================================
// POINTS & STATS
// ============================================

function loadDailyPoints() {
    const childId = appState.currentChild?.user_id;
    if (!childId) return;
    
    console.log('📊 Loading daily points...');
    
    fetch(`../../backend/api/index.php?action=get_daily_points&child_id=${childId}`, {
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        console.log('Points response:', data);
        
        if (data.success) {
            // Update appState
            appState.totalPoints = data.total_points;
            appState.todayPoints = data.today_points;
            appState.waterToday = data.water_intake;
            
            // Update displays
            const totalDisplay = document.getElementById('totalPointsDisplay');
            const todayDisplay = document.getElementById('todayPointsDisplay');
            const waterDisplay = document.getElementById('waterLoggedCount');
            
            if (totalDisplay) totalDisplay.textContent = appState.totalPoints;
            if (todayDisplay) todayDisplay.textContent = appState.todayPoints;
            if (waterDisplay) waterDisplay.textContent = appState.waterToday;
            
            // Update water progress bar
            updateWaterDisplay();
            
            console.log('✅ Points updated:', appState);
        }
    })
    .catch(e => {
        console.error('Error loading points:', e);
    });
}

function loadTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = appState.meals.filter(m => 
        m.meal_date === today || (m.logged_at && m.logged_at.startsWith(today))
    );
    
    const statsDiv = document.getElementById('todayStatsDetail');
    
    if (todayMeals.length === 0) {
        statsDiv.innerHTML = `
            <div class="empty-state-large">
                <div style="font-size: 3rem; margin-bottom: 12px;">🍽️</div>
                <p>No foods logged yet today!</p>
                <p style="color: #999;">Start logging to see your stats!</p>
            </div>
        `;
        return;
    }
    
    const grouped = {};
    todayMeals.forEach(meal => {
        if (!grouped[meal.meal_type]) grouped[meal.meal_type] = [];
        grouped[meal.meal_type].push(meal);
    });
    
    const icons = { breakfast: '🌅', lunch: '🌞', dinner: '🌙', snack: '🍿' };
    let html = '<div class="stats-detail">';
    
    for (const [type, meals] of Object.entries(grouped)) {
        const typePoints = meals.reduce((sum, m) => sum + (m.points_earned || 10), 0);
        html += `<div class="meal-group-detail">
                    <h3>${icons[type]} ${type.charAt(0).toUpperCase() + type.slice(1)} (${typePoints} pts)</h3>`;
        
        meals.forEach(meal => {
            html += `<div class="meal-detail-item">
                        <div class="meal-detail-name">${meal.meal_name}</div>
                        <div class="meal-detail-info">
                            <span class="rating">${'⭐'.repeat(meal.meal_rating)}</span>
                            <span class="points">+${meal.points_earned || 10}</span>
                        </div>
                    </div>`;
        });
        
        html += '</div>';
    }
    
    html += `<div class="total-points-box">
                <div class="icon">🌟</div>
                <strong>Today's Total: ${appState.todayPoints} points!</strong>
            </div>`;
    html += '</div>';
    
    statsDiv.innerHTML = html;
}

// ============================================
// DATA LOADING
// ============================================

function loadFoods() {
    console.log('🍽️ Loading foods...');
    
    fetch('../../backend/api/index.php?action=get_household_foods', {
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            appState.foods = data.foods.map(f => ({
                id: f.food_id,
                name: f.food_name,
                emoji: f.emoji,
                category: f.category
            }));
            console.log('✅ Foods loaded:', appState.foods.length);
        }
    })
    .catch(e => console.error('Error loading foods:', e));
}

function loadMeals() {
    console.log('📜 Loading meals...');
    
    const childId = appState.currentChild?.user_id;
    if (!childId) {
        console.error('No child ID');
        return Promise.resolve([]);
    }
    
    return fetch(`../../backend/api/index.php?action=get_meals&child_id=${childId}`, {
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            appState.meals = data.meals || [];
            console.log('✅ Meals loaded:', appState.meals.length);
            return appState.meals;
        }
        return [];
    })
    .catch(e => {
        console.error('Error loading meals:', e);
        return [];
    });
}

function loadAchievements() {
    const childId = appState.currentChild?.user_id;
    if (!childId) return;
    
    fetch(`../../backend/api/index.php?action=get_achievements&child_id=${childId}`, {
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            appState.achievements = data.achievements || [];
            renderAchievements();
        }
    })
    .catch(e => console.error('Error loading achievements:', e));
}

function renderAchievements() {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    if (!appState.achievements || appState.achievements.length === 0) {
        container.innerHTML = '<p class="empty-state">🎯 Earn achievements by logging meals!</p>';
        return;
    }
    
    const html = appState.achievements.map(a => `
        <div class="achievement-badge">
            <div class="achievement-icon">${a.emoji || '🏆'}</div>
            <div class="achievement-name">${a.name}</div>
            <div class="achievement-description">${a.description}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function loadFoodPreferences() {
    const childId = appState.currentChild?.user_id;
    if (!childId) return;
    
    fetch(`../../backend/api/index.php?action=get_food_preferences&child_id=${childId}`, {
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            renderFoodPreferences(data.preferences || []);
        }
    })
    .catch(e => console.error('Error loading preferences:', e));
}

function renderFoodPreferences(preferences) {
    const container = document.getElementById('preferencesGrid');
    if (!container) return;
    
    if (!preferences || preferences.length === 0) {
        container.innerHTML = '<p class="empty-state">❤️ Foods you rate will appear here!</p>';
        return;
    }
    
    const html = preferences.map(pref => {
        const stars = '⭐'.repeat(pref.rating || 0);
        return `<div class="preference-card">
                    <div class="pref-emoji">${pref.emoji || '🍽️'}</div>
                    <div class="pref-name">${pref.food_name}</div>
                    <div class="pref-rating">${stars}</div>
                </div>`;
    }).join('');
    
    container.innerHTML = html;
}

// ============================================
// MODALS & MESSAGES
// ============================================

function showSuccessModal(message, details = '') {
    const modal = document.getElementById('successModal');
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successDetails').textContent = details;
    modal.classList.remove('hidden');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
}

function showAboutApp() {
    alert(`🥗 NutraKids Child App
    
Your personal healthy eating companion!

📊 Features:
• Log the foods you eat
• Rate how good they are
• Earn points for logging
• Try new foods for bonuses
• Track your water intake
• View your achievements

🌟 Tips:
• Log each food individually
• Rate honestly!
• Drink 8 cups of water daily
• Try new foods for +20 bonus pts

Made with ❤️ for healthy kids
Version 1.1`);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.showScreen = showScreen;
window.selectMealType = selectMealType;
window.selectFood = selectFood;
window.clearFoodSelection = clearFoodSelection;
window.setRating = setRating;
window.handleLogFood = handleLogFood;
window.handleContinueAdding = handleContinueAdding;
window.openWaterLogger = openWaterLogger;
window.closeWaterLogger = closeWaterLogger;
window.addWater = addWater;
window.loadFoodPreferences = loadFoodPreferences;
window.closeSuccessModal = closeSuccessModal;
window.showAboutApp = showAboutApp;

console.log('=== App Ready ===');
