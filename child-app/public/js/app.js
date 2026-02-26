// ============================================
// 🥗 NutraKids - Child App (FIXED VERSION)
// Complete JavaScript for kid-friendly experience
// ============================================

console.log('=== NutraKids Child App Starting ===');

// ============================================
// APP STATE
// ============================================

const appState = {
    currentUser: null,
    currentChild: null,
    meals: [],
    foods: [],
    achievements: [],
    selectedRating: 0
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
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleChildLogin);
        console.log('✅ Login form listener attached');
    }
    
    // Meal logging form
    const mealForm = document.getElementById('mealLoggingForm');
    if (mealForm) {
        mealForm.addEventListener('submit', handleLogMeal);
        console.log('✅ Meal logging form listener attached');
    }
    
    // Logout button
    const childLogoutBtn = document.getElementById('childLogoutBtn');
    if (childLogoutBtn) {
        childLogoutBtn.addEventListener('click', handleLogout);
        console.log('✅ Logout button listener attached');
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
            console.log('User type:', data.user.user_type);
            // Check if user is a child
            if (data.user.user_type === 'child') {
                console.log('✅ Child authenticated, loading dashboard');
                appState.currentUser = data.user;
                appState.currentChild = data.user;
                loadChildDashboard();
            } else {
                console.log('❌ Not a child account, showing login');
                showScreen('loginScreen');
            }
        } else {
            console.log('❌ Not authenticated, showing login');
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
    
    console.log('Attempting login with email:', email);
    
    fetch('../../backend/api/index.php?action=parent_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    })
    .then(r => {
        console.log('Response status:', r.status);
        return r.json();
    })
    .then(data => {
        console.log('Login response:', data);
        
        if (data.success && data.user) {
            console.log('User type from server:', data.user.user_type);
            
            // ⭐ CHECK IF CHILD ACCOUNT ⭐
            if (data.user.user_type === 'child') {
                console.log('✅ Child account detected - login successful');
                appState.currentUser = data.user;
                appState.currentChild = data.user;
                clearLoginErrors();
                loadChildDashboard();
            } else {
                console.log('❌ Account is not a child account:', data.user.user_type);
                showLoginError('❌ This is not a child account! Ask your parents for your login info.');
            }
        } else {
            console.log('❌ Login failed:', data.message);
            showLoginError(data.message || 'Login failed. Check your email and password!');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showLoginError('Connection error. Please try again!');
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
        console.log('✅ Logged out');
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
    loadMeals();
    loadAchievements();
    loadTodayStats();
    showScreen('childDashboard');
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function showScreen(screenId) {
    console.log('📱 Switching to screen:', screenId);
    
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('✅ Screen switched to:', screenId);
    }
}

// ============================================
// MEALS & FOOD
// ============================================

function loadFoods() {
    console.log('🍽️ Loading foods from API...');
    
    fetch('../../backend/api/index.php?action=get_household_foods', {
        method: 'GET',
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        console.log('Foods loaded:', data);
        
        if (data.success) {
            appState.foods = data.foods.map(f => ({
                id: f.food_id,
                name: f.food_name,
                emoji: f.emoji,
                category: f.category
            }));
            console.log('✅ Foods count:', appState.foods.length);
        }
    })
    .catch(e => {
        console.error('Error loading foods:', e);
        appState.foods = [];
    });
}

function loadMeals() {
    console.log('📜 Loading meals from API...');
    
    fetch('../../backend/api/index.php?action=get_meals', {
        method: 'GET',
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        console.log('Meals loaded:', data);
        
        if (data.success) {
            appState.meals = data.meals || [];
            console.log('✅ Meals count:', appState.meals.length);
        }
    })
    .catch(e => {
        console.error('Error loading meals:', e);
        appState.meals = [];
    });
}

// ============================================
// MEAL LOGGING
// ============================================

function setRating(rating) {
    console.log('⭐ Setting rating:', rating);
    
    appState.selectedRating = rating;
    document.getElementById('mealRating').value = rating;
    
    // Visual feedback
    const buttons = document.querySelectorAll('.rating-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.rating) === rating) {
            btn.classList.add('selected');
        }
    });
}

function handleLogMeal(e) {
    e.preventDefault();
    console.log('🍽️ === LOG MEAL START ===');
    
    const mealName = document.getElementById('mealName').value.trim();
    const mealType = document.getElementById('mealType').value;
    const rating = appState.selectedRating;
    
    if (!mealName || !mealType || !rating) {
        alert('Please fill all fields and select a rating! 🙏');
        return;
    }
    
    console.log('Logging meal:', { mealName, mealType, rating });
    
    fetch('../../backend/api/index.php?action=log_meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            meal_name: mealName,
            meal_type: mealType,
            rating: rating
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Log meal response:', data);
        
        if (data.success) {
            console.log('✅ Meal logged successfully');
            
            // Reset form
            document.getElementById('mealLoggingForm').reset();
            appState.selectedRating = 0;
            document.querySelectorAll('.rating-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Reload meals and show success
            loadMeals();
            loadTodayStats();
            
            showSuccessModal('🎉 Awesome! Your meal has been saved!');
            
            // Return to dashboard after celebration
            setTimeout(() => {
                showScreen('childDashboard');
            }, 2000);
        } else {
            alert('Error: ' + (data.message || 'Failed to log meal'));
        }
    })
    .catch(error => {
        console.error('Error logging meal:', error);
        alert('Connection error: ' + error.message);
    });
}

// ============================================
// ACHIEVEMENTS
// ============================================

function loadAchievements() {
    console.log('🏆 Loading achievements...');
    
    const childId = appState.currentChild?.user_id;
    if (!childId) {
        console.error('No child ID for achievements');
        return;
    }
    
    fetch(`../../backend/api/index.php?action=get_achievements&child_id=${childId}`, {
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        console.log('Achievements response:', data);
        
        if (data.success && data.achievements) {
            appState.achievements = data.achievements;
            renderAchievements();
        }
    })
    .catch(e => {
        console.error('Error loading achievements:', e);
    });
}

function renderAchievements() {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    if (!appState.achievements || appState.achievements.length === 0) {
        container.innerHTML = '<p>🎯 Earn achievements by logging meals and staying healthy!</p>';
        return;
    }
    
    const html = appState.achievements.map(achievement => `
        <div class="achievement-badge">
            <div class="achievement-icon">${achievement.emoji || '🏆'}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// ============================================
// TODAY'S STATS
// ============================================

function loadTodayStats() {
    console.log('📊 Loading today stats...');
    
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = appState.meals.filter(m => m.meal_date === today);
    
    console.log('Today:', today);
    console.log('Today meals:', todayMeals.length);
    
    // Update stats display
    document.getElementById('mealsToday').textContent = todayMeals.length;
    document.getElementById('pointsToday').textContent = (todayMeals.length * 10);
    
    // Update detailed stats
    updateDetailedStats(todayMeals);
    
    // Generate daily challenge
    generateDailyChallenge(todayMeals);
}

function updateDetailedStats(todayMeals) {
    const statsDiv = document.getElementById('todayStatsDetail');
    if (!statsDiv) return;
    
    if (todayMeals.length === 0) {
        statsDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 16px;">
                <div style="font-size: 3rem; margin-bottom: 12px;">🍽️</div>
                <p style="font-size: 1.2rem; color: #666;">No meals logged yet today!</p>
                <p style="color: #999;">Log your first meal to get started! 🌟</p>
            </div>
        `;
        return;
    }
    
    const mealsHtml = todayMeals.map(meal => `
        <div style="background: white; padding: 16px; border-radius: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${meal.meal_name}</strong>
                <div style="color: #999; font-size: 0.9rem;">🕐 ${meal.meal_time || 'Time not recorded'}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 1.5rem;">${'⭐'.repeat(meal.meal_rating || 0)}</div>
                <div style="color: #999; font-size: 0.9rem;">+10 pts</div>
            </div>
        </div>
    `).join('');
    
    statsDiv.innerHTML = `
        <div style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 12px;">📊 Your Meals Today</h3>
            ${mealsHtml}
        </div>
        <div style="background: linear-gradient(135deg, #95E1D3 0%, #80D9D1 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🌟</div>
            <strong style="font-size: 1.2rem;">Total Points Today: ${todayMeals.length * 10}</strong>
        </div>
    `;
}

function generateDailyChallenge(todayMeals) {
    const challengeDiv = document.getElementById('todayChallenge');
    if (!challengeDiv) return;
    
    const challenges = [
        { icon: '🥗', text: 'Try a new vegetable today!', points: 20 },
        { icon: '💧', text: 'Drink 8 glasses of water!', points: 15 },
        { icon: '🍎', text: 'Eat a fruit for snack time!', points: 15 },
        { icon: '🥇', text: 'Rate 3 meals today!', points: 25 },
        { icon: '⚡', text: 'Be healthy champion today!', points: 20 }
    ];
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    challengeDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px;">
            <div style="font-size: 2.5rem;">${challenge.icon}</div>
            <div>
                <strong style="font-size: 1.1rem;">${challenge.text}</strong>
                <div style="color: #888; font-size: 0.95rem;">+${challenge.points} bonus points! 🎁</div>
            </div>
        </div>
    `;
}

// ============================================
// FOOD PREFERENCES
// ============================================

function loadFoodPreferences() {
    console.log('❤️ Loading food preferences...');
    
    const childId = appState.currentChild?.user_id;
    if (!childId) {
        console.error('No child ID for preferences');
        return;
    }
    
    fetch(`../../backend/api/index.php?action=get_food_preferences&child_id=${childId}`, {
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        console.log('Food preferences response:', data);
        
        if (data.success && data.preferences) {
            renderFoodPreferences(data.preferences);
        }
    })
    .catch(e => {
        console.error('Error loading preferences:', e);
    });
}

function renderFoodPreferences(preferences) {
    const container = document.getElementById('preferencesGrid');
    if (!container) return;
    
    if (!preferences || preferences.length === 0) {
        container.innerHTML = '<p>📋 Your food preferences will appear here!</p>';
        return;
    }
    
    const html = preferences.map(pref => {
        const stars = pref.rating ? '⭐'.repeat(pref.rating) : 'Not rated yet';
        return `
            <div class="food-card">
                <div class="emoji">${pref.emoji || '🍽️'}</div>
                <div class="name">${pref.food_name}</div>
                <div style="font-size: 0.9rem; color: #666; margin-top: 8px;">${stars}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// ============================================
// MEAL HISTORY
// ============================================

function loadMealHistory() {
    console.log('📜 Loading meal history...');
    
    const container = document.getElementById('mealHistoryContainer');
    if (!container) return;
    
    if (!appState.meals || appState.meals.length === 0) {
        container.innerHTML = '<p>📜 No meals logged yet. Start logging to build your history!</p>';
        return;
    }
    
    // Group meals by date (most recent first)
    const sortedMeals = [...appState.meals].sort((a, b) => 
        new Date(b.meal_date) - new Date(a.meal_date)
    );
    
    const grouped = {};
    sortedMeals.forEach(meal => {
        if (!grouped[meal.meal_date]) {
            grouped[meal.meal_date] = [];
        }
        grouped[meal.meal_date].push(meal);
    });
    
    let html = '';
    for (const [date, meals] of Object.entries(grouped)) {
        const dateObj = new Date(date);
        const dateStr = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        html += `<h3 style="margin-top: 24px; margin-bottom: 12px;">📅 ${dateStr}</h3>`;
        
        meals.forEach(meal => {
            html += `
                <div style="background: white; padding: 16px; border-radius: 12px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="font-size: 1.1rem;">${meal.meal_name}</strong>
                            <div style="color: #999; font-size: 0.9rem;">🕐 ${meal.meal_time || 'No time recorded'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem;">${'⭐'.repeat(meal.meal_rating || 0) || '(Not rated)'}</div>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html || '<p>No meal history available.</p>';
}

// ============================================
// SUCCESS MODAL
// ============================================

function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    const messageEl = document.getElementById('successMessage');
    
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// ============================================
// ABOUT APP
// ============================================

function showAboutApp() {
    alert(`
🥗 NutraKids Child App

Your personal healthy eating companion!

📊 Features:
• Log your meals
• Track today's stats
• Earn achievements
• See your favorite foods
• View your meal history

🌟 Tips:
• Rate each meal honestly
• Try new foods every day
• Stay healthy and happy!

Made with ❤️ for healthy kids
Version 1.0 - FIXED
    `);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.showScreen = showScreen;
window.handleLogMeal = handleLogMeal;
window.setRating = setRating;
window.loadFoodPreferences = loadFoodPreferences;
window.loadMealHistory = loadMealHistory;
window.showSuccessModal = showSuccessModal;
window.closeSuccessModal = closeSuccessModal;
window.showAboutApp = showAboutApp;
