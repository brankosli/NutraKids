/**
 * NutraKids - Complete Application JavaScript
 * All features working with proper API integration
 */

console.log('=== NutraKids App Starting ===');

// ============================================
// STATE MANAGEMENT
// ============================================

const appState = {
    currentUser: null,
    currentChild: null,
    children: [],
    meals: [],
    achievements: [],
    foods: [],  // Will be loaded from database
    selectedFoods: {},
    mealRating: 0
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');
    setupEventListeners();
    checkAuth();
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Login form - MUST prevent default!
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            console.log('Login form submitted');
            e.preventDefault();
            handleLogin(e);
        });
        console.log('Login form listener attached');
    } else {
        console.error('Login form not found!');
    }

    // Child profile form
    const childForm = document.getElementById('childProfileForm');
    if (childForm) {
        childForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCreateChild(e);
        });
    }

    // Meal logging form
    const mealForm = document.getElementById('mealLoggingForm');
    if (mealForm) {
        mealForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleMealLog(e);
        });
    }

    // Logout buttons
    const parentLogout = document.getElementById('parentLogoutBtn');
    if (parentLogout) {
        parentLogout.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    const childLogout = document.getElementById('childLogoutBtn');
    if (childLogout) {
        childLogout.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Add child button
    const addChildBtn = document.getElementById('addChildBtn');
    if (addChildBtn) {
        addChildBtn.addEventListener('click', () => {
            showScreen('childProfileScreen');
        });
    }

    // Manage foods button
    const manageFoodsBtn = document.getElementById('manageFoodsBtn');
    if (manageFoodsBtn) {
        manageFoodsBtn.addEventListener('click', showManageFoods);
    }

    // Add food form - handle Suggest button instead of submit
    const addFoodForm = document.getElementById('addFoodForm');
    if (addFoodForm) {
        addFoodForm.addEventListener('submit', (e) => {
            e.preventDefault();
            return false;
        });
    }

    // Suggest food with AI button
    const suggestFoodBtn = document.getElementById('suggestFoodBtn');
    if (suggestFoodBtn) {
        suggestFoodBtn.addEventListener('click', handleSuggestFood);
    }

    // Confirm food suggestion button
    const confirmFoodBtn = document.getElementById('confirmFoodBtn');
    if (confirmFoodBtn) {
        confirmFoodBtn.addEventListener('click', handleConfirmFood);
    }

    // Reject suggestion button
    const rejectSuggestionBtn = document.getElementById('rejectSuggestionBtn');
    if (rejectSuggestionBtn) {
        rejectSuggestionBtn.addEventListener('click', handleRejectSuggestion);
    }

    // Modal close button
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Meal rating buttons
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const rating = btn.dataset.rating;
            document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById('mealRating').value = rating;
        });
    });

    // Food questionnaire buttons
    const completeBtn = document.getElementById('completeFoodBtn');
    if (completeBtn) {
        completeBtn.addEventListener('click', completeQuestionnaire);
    }

    console.log('Event listeners setup complete');
}

// ============================================
// SCREEN MANAGEMENT
// ============================================

function showScreen(screenId) {
    console.log('=== SCREEN SWITCH START ===');
    console.log('Target screen:', screenId);
    
    const allScreens = document.querySelectorAll('.screen');
    console.log('Total screens found:', allScreens.length);
    
    allScreens.forEach(screen => {
        const hadActive = screen.classList.contains('active');
        screen.classList.remove('active');
        console.log('Removed active from:', screen.id, '(was active:', hadActive + ')');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (!targetScreen) {
        console.error('ERROR: Screen not found:', screenId);
        console.log('=== SCREEN SWITCH FAILED ===');
        return;
    }
    
    targetScreen.classList.add('active');
    console.log('Added active to:', screenId);
    window.scrollTo(0, 0);
    
    const nowActive = document.querySelectorAll('.screen.active');
    console.log('Screens now active:', nowActive.length, '(should be 1)');
    nowActive.forEach(s => console.log('  -', s.id));
    
    console.log('=== SCREEN SWITCH COMPLETE ===');
}

// ============================================
// AUTHENTICATION
// ============================================

function checkAuth() {
    console.log('Checking authentication...');
    
    // Check if user is already authenticated via session
    fetch('../../backend/api/index.php?action=auth_check', { 
        method: 'GET',
        credentials: 'include' 
    })
    .then(r => r.json())
    .then(data => {
        console.log('Auth check response:', data);
        // API returns {authenticated: true/false, user: {...}} - no success field!
        if (data.authenticated) {
            console.log('✅ Session is active, loading dashboard');
            appState.currentUser = data.user;
            loadDashboard();
        } else {
            console.log('Not authenticated, showing login');
            showScreen('loginScreen');
        }
    })
    .catch(e => {
        console.error('Auth check error:', e);
        console.log('Error checking auth, showing login as fallback');
        showScreen('loginScreen');
    });
}

function handleLogin(e) {
    e.preventDefault();
    console.log('handleLogin called');

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorDiv = document.getElementById('loginError');

    console.log('Email input element:', emailInput);
    console.log('Password input element:', passwordInput);

    if (!emailInput || !passwordInput) {
        console.error('ERROR: Login input elements not found!');
        console.error('loginEmail:', emailInput);
        console.error('loginPassword:', passwordInput);
        alert('ERROR: Login form elements not found. Check browser console.');
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    console.log('Login attempt with email:', email);

    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }

    fetch('../../backend/api/index.php?action=parent_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    })
        .then(r => {
            console.log('API Response status:', r.status);
            console.log('API Response headers:', {
                'content-type': r.headers.get('content-type')
            });
            return r.text();  // Get raw text first
        })
        .then(rawText => {
            console.log('RAW API RESPONSE TEXT:');
            console.log(rawText);
            console.log('--- END RAW RESPONSE ---');
            
            // Try to parse as JSON
            try {
                const data = JSON.parse(rawText);
                console.log('Login response:', data);

                if (data.success) {
                    console.log('Login successful, user_type:', data.user.user_type);
                    
                    // ⭐ CHECK IF PARENT ACCOUNT ⭐
                    if (data.user.user_type === 'parent') {
                        console.log('✅ Parent account detected, loading dashboard');
                        appState.currentUser = data.user;
                        loadDashboard();
                    } else {
                        console.log('❌ Not a parent account, user_type:', data.user.user_type);
                        if (errorDiv) {
                            errorDiv.textContent = '❌ This is not a parent account! Please use your parent login.';
                            errorDiv.classList.add('show');
                        }
                    }
                } else {
                    if (errorDiv) {
                        errorDiv.textContent = '❌ ' + (data.message || 'Login failed');
                        errorDiv.classList.add('show');
                    }
                }
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                console.error('Response was:', rawText.substring(0, 500));
                if (errorDiv) {
                    errorDiv.textContent = '❌ Server error - see console';
                    errorDiv.classList.add('show');
                }
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            if (errorDiv) {
                errorDiv.textContent = '❌ Connection error';
                errorDiv.classList.add('show');
            }
        });
}

function handleLogout(e) {
    if (e) e.preventDefault();
    console.log('Logout initiated');

    fetch('../../backend/api/index.php?action=logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(() => {
        appState.currentUser = null;
        appState.currentChild = null;
        showScreen('loginScreen');
    });
}

// ============================================
// PARENT DASHBOARD
// ============================================

function loadDashboard() {
    console.log('Loading parent dashboard...');

    if (appState.currentUser?.first_name) {
        document.getElementById('parentName').textContent = appState.currentUser.first_name;
    }

    loadFoods();  // Load foods for the household
    showScreen('parentDashboard');
    loadChildren();
}

function loadChildren() {
    console.log('Loading children from API...');

    fetch('../../backend/api/index.php?action=get_children', {
        method: 'GET',
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        console.log('Children loaded:', data);
        
        if (data.success) {
            appState.children = data.children;
            console.log('Children count:', appState.children.length);
        } else {
            console.error('Error loading children:', data.message);
            appState.children = [];
        }
        
        renderChildrenList();
    })
    .catch(e => {
        console.error('Error loading children:', e);
        appState.children = [];
        renderChildrenList();
    });
}

function renderChildrenList() {
    const childrenList = document.getElementById('childrenList');
    if (!childrenList) return;
    
    if (appState.children.length === 0) {
        childrenList.innerHTML = '<p>No children added yet</p>';
    } else {
        childrenList.innerHTML = appState.children.map(child => `
            <div class="child-card" onclick="selectChild(${child.user_id})">
                <div class="child-emoji">👧</div>
                <h4>${child.first_name}</h4>
                <p>Age ${child.age}</p>
            </div>
        `).join('');
    }
}

// ============================================
// CHILD PROFILE CREATION
// ============================================

function handleCreateChild(e) {
    e.preventDefault();

    const name = document.getElementById('childName').value;
    const age = document.getElementById('childAge').value;
    const allergies = Array.from(document.querySelectorAll('input[name="allergies"]:checked')).map(cb => cb.value);
    const goals = Array.from(document.querySelectorAll('input[name="goals"]:checked')).map(cb => cb.value);
    const calories = document.getElementById('calorieTarget').value;

    console.log('Creating child:', name, age);
    console.log('Allergies:', allergies);
    console.log('Goals:', goals);

    fetch('../../backend/api/index.php?action=create_child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            name: name,
            age: parseInt(age),
            allergies: allergies,
            goals: goals,
            calories: parseInt(calories)
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Create child response:', data);
        
        if (data.success) {
            appState.currentChild = data.child;
            console.log('Child created:', data.child);
            
            document.getElementById('foodQuestionChild').textContent = name;
            appState.selectedFoods = {};
            renderFoodCards();
            showScreen('foodQuestionnaireScreen');
        } else {
            alert('Error: ' + (data.message || 'Failed to create child'));
        }
    })
    .catch(error => {
        console.error('Error creating child:', error);
        alert('Connection error: ' + error.message);
    });
}

// ============================================
// FOOD MANAGEMENT
// ============================================

function loadFoods() {
    console.log('Loading foods from API...');

    return fetch('../../backend/api/index.php?action=get_household_foods', {
        method: 'GET',
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        console.log('Foods loaded:', data);
        
        if (data.success) {
            // Convert food_name to name for compatibility
            appState.foods = data.foods.map(f => ({
                id: f.food_id,
                name: f.food_name,
                emoji: f.emoji,
                category: f.category
            }));
            console.log('Foods count:', appState.foods.length);
            return appState.foods;
        } else {
            console.error('Error loading foods:', data.message);
            appState.foods = [];
            throw new Error(data.message);
        }
    })
    .catch(e => {
        console.error('Error loading foods:', e);
        appState.foods = [];
    });
}

function showManageFoods() {
    console.log('Showing manage foods screen');
    loadFoods();
    setTimeout(() => {
        renderFoodsList();
        showScreen('manageFoodsScreen');
    }, 500);
}

function renderFoodsList() {
    const foodsList = document.getElementById('foodsList');
    if (!foodsList) return;
    
    if (appState.foods.length === 0) {
        foodsList.innerHTML = '<p>No foods added yet. Add your first food above!</p>';
        return;
    }
    
    const grouped = {};
    appState.foods.forEach(food => {
        if (!grouped[food.category]) {
            grouped[food.category] = [];
        }
        grouped[food.category].push(food);
    });
    
    let html = '';
    Object.keys(grouped).sort().forEach(category => {
        html += `<h4 style="margin-top: 20px; color: #666;">${category}</h4>`;
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">';
        grouped[category].forEach(food => {
            html += `
                <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 1.5rem;">${food.emoji}</div>
                        <div style="font-weight: 600; margin-top: 5px;">${food.name}</div>
                    </div>
                    <button onclick="deleteFood(${food.id})" class="btn-delete" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✕</button>
                </div>
            `;
        });
        html += '</div>';
    });
    
    foodsList.innerHTML = html;
}

function handleSuggestFood() {
    const foodName = document.getElementById('foodNameInput').value.trim();
    
    if (!foodName || foodName.length < 2) {
        alert('Please enter a food name');
        return;
    }
    
    console.log('Suggesting food with Claude:', foodName);
    
    // Show loading
    document.getElementById('loadingBox').style.display = 'block';
    document.getElementById('suggestionBox').style.display = 'none';
    
    fetch('../../backend/api/index.php?action=suggest_food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            food_name: foodName
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Claude suggestion response:', data);
        document.getElementById('loadingBox').style.display = 'none';
        
        if (data.success) {
            // Display suggestion
            document.getElementById('suggestedName').value = data.suggestion.corrected_name || foodName;
            document.getElementById('suggestedEmoji').value = data.suggestion.emoji || '🍽️';
            document.getElementById('suggestedCategory').value = data.suggestion.category || 'Other';
            
            document.getElementById('suggestionBox').style.display = 'block';
            console.log('✅ Claude suggestion received:', data.suggestion);
        } else {
            document.getElementById('loadingBox').style.display = 'none';
            alert('Error: ' + (data.message || 'Failed to get suggestion'));
        }
    })
    .catch(error => {
        console.error('Error getting suggestion:', error);
        document.getElementById('loadingBox').style.display = 'none';
        alert('Connection error: ' + error.message);
    });
}

function handleConfirmFood() {
    console.log('Confirming food suggestion');
    
    const name = document.getElementById('suggestedName').value.trim();
    const emoji = document.getElementById('suggestedEmoji').value.trim();
    const category = document.getElementById('suggestedCategory').value;
    
    if (!name || !emoji || !category) {
        alert('Please fill all fields');
        return;
    }
    
    // CHECK: Is this food already in the household?
    const foodExists = appState.foods.some(f => 
        f.name.toLowerCase() === name.toLowerCase()
    );
    
    if (foodExists) {
        alert(`🍽️ "${name}" is already in your household foods!\n\nNo need to add it twice.`);
        return;  // ← Don't add, show error
    }
    
    console.log('Adding food:', { name, emoji, category });
    
    fetch('../../backend/api/index.php?action=add_food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            food_name: name,
            emoji: emoji,
            category: category
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Add food response:', data);
        
        if (data.success) {
            console.log('✅ Food added via Claude suggestion');
            
            // COMPLETELY RESET ALL FORM FIELDS
            document.getElementById('foodNameInput').value = '';
            document.getElementById('suggestedName').value = '';
            document.getElementById('suggestedEmoji').value = '';
            document.getElementById('suggestedCategory').value = 'Other';
            
            // Hide all suggestion boxes
            document.getElementById('suggestionBox').style.display = 'none';
            document.getElementById('loadingBox').style.display = 'none';
            
            // Focus back to input for next food
            setTimeout(() => {
                document.getElementById('foodNameInput').focus();
            }, 100);
            
            // Reload foods and wait for completion before rendering
            console.log('Reloading foods after add...');
            loadFoods().then(() => {
                console.log('Foods loaded, count:', appState.foods.length);
                renderFoodsList();
                console.log('✅ Foods list refreshed');
            }).catch(e => {
                console.error('Error loading foods:', e);
                renderFoodsList();  // Render anyway even on error
            });
            
            alert('🎉 Food added!');
        } else {
            alert('Error: ' + (data.message || 'Failed to add food'));
        }
    })
    .catch(error => {
        console.error('Error adding food:', error);
        alert('Connection error: ' + error.message);
    });
}

function handleRejectSuggestion() {
    console.log('Rejecting suggestion, trying again');
    document.getElementById('suggestionBox').style.display = 'none';
    document.getElementById('foodNameInput').value = '';
    document.getElementById('foodNameInput').focus();
}

function deleteFood(foodId) {
    if (!confirm('Delete this food?')) return;
    
    console.log('Deleting food:', foodId);
    
    fetch('../../backend/api/index.php?action=delete_food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            food_id: foodId
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Delete food response:', data);
        
        if (data.success) {
            console.log('✅ Food deleted');
            loadFoods().then(() => {
                console.log('Foods reloaded, count:', appState.foods.length);
                renderFoodsList();
            }).catch(e => {
                console.error('Error reloading foods:', e);
                renderFoodsList();
            });
        } else {
            alert('Error: ' + (data.message || 'Failed to delete food'));
        }
    })
    .catch(error => {
        console.error('Error deleting food:', error);
        alert('Connection error: ' + error.message);
    });
}

function renderFoodCards() {
    const foodGrid = document.getElementById('foodGrid');
    if (!foodGrid) return;

    appState.selectedFoods = {};

    foodGrid.innerHTML = appState.foods.map(food => `
        <div class="food-card">
            <div class="emoji">${food.emoji}</div>
            <div class="name">${food.name}</div>
            <div class="rating-buttons">
                <button class="rating-btn" data-food-id="${food.id}" data-rating="1">😢</button>
                <button class="rating-btn" data-food-id="${food.id}" data-rating="2">😐</button>
                <button class="rating-btn" data-food-id="${food.id}" data-rating="3">🙂</button>
                <button class="rating-btn" data-food-id="${food.id}" data-rating="4">😊</button>
                <button class="rating-btn" data-food-id="${food.id}" data-rating="5">😍</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.food-card .rating-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const foodId = btn.dataset.foodId;
            const rating = btn.dataset.rating;

            appState.selectedFoods[foodId] = rating;

            const foodCard = btn.closest('.food-card');
            foodCard.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            updateFoodProgress();
        });
    });
}

function updateFoodProgress() {
    const rated = Object.keys(appState.selectedFoods).length;
    const total = appState.foods.length;
    const progress = (rated / total) * 100;

    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `${rated} / ${total} foods rated`;

    const completeBtn = document.getElementById('completeFoodBtn');
    if (completeBtn) {
        completeBtn.disabled = rated < 5;
    }
}

function completeQuestionnaire() {
    console.log('=== COMPLETE QUESTIONNAIRE START ===');
    console.log('Selected foods count:', Object.keys(appState.selectedFoods).length);
    console.log('Selected foods data:', appState.selectedFoods);
    console.log('Current child:', appState.currentChild);

    // Save preferences to database
    if (appState.currentChild && appState.currentChild.user_id) {
        console.log('Saving food preferences to API...');
        console.log('Child ID to save:', appState.currentChild.user_id);
        console.log('Preferences object:', appState.selectedFoods);
        
        const payload = {
            child_id: appState.currentChild.user_id,
            preferences: appState.selectedFoods
        };
        console.log('Full payload:', JSON.stringify(payload));
        
        fetch('../../backend/api/index.php?action=save_food_preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        })
        .then(r => {
            console.log('API response status:', r.status);
            return r.json();
        })
        .then(data => {
            console.log('Save preferences response:', data);
            if (data.success) {
                console.log('✅ Food preferences saved to database:', data.count, 'foods');
                appState.currentChild.foodPreferences = appState.selectedFoods;
            } else {
                console.error('❌ Error saving preferences:', data.message);
            }
        })
        .catch(e => {
            console.error('❌ Network error saving preferences:', e);
        });
    } else {
        console.error('❌ Cannot save: no currentChild or user_id');
        console.error('appState.currentChild:', appState.currentChild);
    }

    if (appState.currentChild) {
        console.log('Setting child name to:', appState.currentChild.first_name);
        
        const nameElement = document.getElementById('childNameDisplay');
        if (nameElement) {
            nameElement.textContent = appState.currentChild.first_name;
            console.log('✅ Name element updated');
        } else {
            console.error('❌ Name element not found');
        }
        
        // Reset form and selected foods
        document.getElementById('childProfileForm').reset();
        appState.selectedFoods = {};
        
        // Reload children list to show the new child on parent dashboard
        console.log('Reloading children list...');
        loadChildren();
        
        // Return to parent dashboard after a brief delay
        setTimeout(() => {
            console.log('Returning to parent dashboard');
            showScreen('parentDashboard');
        }, 800);
    }
    
    console.log('=== COMPLETE QUESTIONNAIRE END ===');
}

// ============================================
// CHILD SELECTION
// ============================================

function selectChild(childId) {
    console.log('Selecting child:', childId);

    appState.currentChild = appState.children.find(c => c.user_id === childId);
    if (appState.currentChild) {
        console.log('Child found:', appState.currentChild);
        console.log('Setting child name to:', appState.currentChild.first_name);
        
        const nameElement = document.getElementById('childNameDisplay');
        if (nameElement) {
            nameElement.textContent = appState.currentChild.first_name;
            console.log('Name element updated');
        } else {
            console.error('Name element not found');
        }
        
        // Load food preferences from database
        console.log('Loading food preferences for child:', childId);
        fetch('../../backend/api/index.php?action=get_food_preferences&child_id=' + childId, {
            credentials: 'include'
        })
        .then(r => r.json())
        .then(data => {
            console.log('Food preferences response:', data);
            if (data.success && data.preferences && Array.isArray(data.preferences)) {
                // Transform array into object indexed by food_id for easy lookup
                // API returns: [{food_id: 1, rating: 5, ...}, ...]
                // We need: {1: 5, 4: 4, ...}
                const prefsObject = {};
                data.preferences.forEach(pref => {
                    prefsObject[pref.food_id] = pref.rating;
                });
                appState.currentChild.foodPreferences = prefsObject;
                appState.currentChild.foodPreferencesDetails = data.preferences;  // Store full details too
                console.log('Food preferences transformed to object:', prefsObject);
            } else {
                console.log('No food preferences found');
                appState.currentChild.foodPreferences = {};
                appState.currentChild.foodPreferencesDetails = [];
            }
        })
        .catch(e => {
            console.error('Error loading food preferences:', e);
            appState.currentChild.foodPreferences = {};
            appState.currentChild.foodPreferencesDetails = [];
        });
        
        loadMealHistory();
        loadAchievements();
        loadTodayStats();
        showScreen('childDashboard');
    } else {
        console.error('Child not found:', childId);
    }
}

// ============================================
// MEAL LOGGING
// ============================================

function showMealLogging() {
    console.log('Showing meal logging modal');
    document.getElementById('mealLoggingModal').classList.add('show');
}

function closeModal() {
    document.getElementById('mealLoggingModal').classList.remove('show');
}

function handleMealLog(e) {
    e.preventDefault();
    
    const mealType = document.getElementById('mealType').value;
    const mealName = document.getElementById('mealName').value;
    const rating = document.getElementById('mealRating').value;
    
    console.log('Logging meal:', mealType, mealName, rating);
    
    if (!mealType || !mealName || !rating) {
        alert('Please fill all fields and select a rating');
        return;
    }
    
    if (!appState.currentChild || !appState.currentChild.user_id) {
        alert('No child selected');
        return;
    }
    
    fetch('../../backend/api/index.php?action=log_meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            child_id: appState.currentChild.user_id,
            meal_type: mealType,
            meal_name: mealName,
            meal_rating: parseInt(rating)
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Log meal response:', data);
        
        if (data.success) {
            console.log('Meal logged successfully!');
            
            closeModal();
            loadMealHistory();
            document.getElementById('mealLoggingForm').reset();
            document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
            
            alert('🎉 Meal logged! You earned ' + data.points + ' points!');
        } else {
            alert('Error: ' + (data.message || 'Failed to log meal'));
        }
    })
    .catch(error => {
        console.error('Error logging meal:', error);
        alert('Connection error: ' + error.message);
    });
}

function loadMealHistory() {
    console.log('Loading meal history from API...');
    
    if (!appState.currentChild || !appState.currentChild.user_id) {
        console.log('No child selected, showing empty');
        const mealsList = document.getElementById('mealsList');
        if (mealsList) {
            mealsList.innerHTML = '<p>No meals logged yet. Log your first meal!</p>';
        }
        loadTodayStats();
        return;
    }
    
    fetch('../../backend/api/index.php?action=get_meals&child_id=' + appState.currentChild.user_id, {
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        console.log('Meals loaded:', data);
        
        if (data.success) {
            appState.meals = data.meals;
            console.log('Meals count:', appState.meals.length);
        } else {
            console.error('Error loading meals:', data.message);
            appState.meals = [];
        }
        
        renderMealsList();
        loadTodayStats();
    })
    .catch(e => {
        console.error('Error loading meals:', e);
        appState.meals = [];
        renderMealsList();
        loadTodayStats();
    });
}

function renderMealsList() {
    const mealsList = document.getElementById('mealsList');
    if (!mealsList) return;
    
    if (appState.meals.length === 0) {
        mealsList.innerHTML = '<p>No meals logged yet. Log your first meal!</p>';
    } else {
        mealsList.innerHTML = appState.meals.map(meal => `
            <div class="meal-item">
                <div class="meal-info">
                    <h4>${meal.meal_name}</h4>
                    <p>${meal.meal_type} - ${meal.meal_date}</p>
                </div>
                <div class="meal-rating">
                    ${'⭐'.repeat(meal.meal_rating)}
                </div>
            </div>
        `).join('');
    }
}

// ============================================
// ACHIEVEMENTS
// ============================================

function loadAchievements() {
    console.log('Loading achievements...');

    appState.achievements = [
        { id: 1, name: 'First Meal', description: 'Log your first meal', icon: '🍽️', earned: appState.meals.length > 0 },
        { id: 2, name: 'Weekly Champion', description: 'Log 7 meals in a week', icon: '🏆', earned: appState.meals.length >= 7 },
        { id: 3, name: 'Vegetable Explorer', description: 'Try 5 different vegetables', icon: '🥦', earned: false },
        { id: 4, name: 'Adventurous Eater', description: 'Try 10 new foods', icon: '🍜', earned: false },
        { id: 5, name: 'Hydration Hero', description: 'Drink 8 cups of water', icon: '💧', earned: false },
    ];

    const achievementsList = document.getElementById('achievementsList');
    if (achievementsList) {
        achievementsList.innerHTML = appState.achievements.map(ach => `
            <div class="achievement-card ${ach.earned ? 'earned' : 'locked'}">
                <div class="achievement-icon">${ach.earned ? ach.icon : '🔒'}</div>
                <h4>${ach.name}</h4>
                <p>${ach.description}</p>
            </div>
        `).join('');
    }
}

// ============================================
// FOOD PREFERENCES DISPLAY
// ============================================

function showFoodPreferences() {
    console.log('Showing food preferences');
    
    const preferencesGrid = document.getElementById('preferencesGrid');
    if (!preferencesGrid) return;

    // Show ALL household foods, not just ones with ratings
    if (!appState.foods || appState.foods.length === 0) {
        preferencesGrid.innerHTML = '<p>No foods in household yet. Add foods first!</p>';
        return;
    }

    const prefs = appState.currentChild.foodPreferences || {};
    console.log('Preferences object:', prefs);
    console.log('Foods to display:', appState.foods.length);

    let html = '';
    appState.foods.forEach(food => {
        const rating = prefs[food.id] || 0;  // Default to 0 if not rated
        const stars = rating > 0 ? '⭐'.repeat(rating) : '(Not rated)';
        const ratingText = rating > 0 ? `${rating}/5` : 'No rating';
        
        // Show all foods with their current rating (or empty state)
        // Allow parent to click to edit ratings
        html += `
            <div class="food-card" style="border-top: 4px solid var(--primary); background: rgba(76,175,80,0.05);" onclick="editFoodPreference(${food.id}, '${food.name}')">
                <div class="emoji">${food.emoji}</div>
                <div class="name">${food.name}</div>
                <div class="meal-rating" style="font-size: 1.2rem; cursor: pointer;">${stars}</div>
                <small style="color: #666; cursor: pointer;">${ratingText}</small>
                <small style="color: #2196F3; margin-top: 5px; display: block; font-size: 0.75rem;">Click to edit</small>
            </div>
        `;
    });

    preferencesGrid.innerHTML = html;
}

// New function to allow parent editing of food preferences
function editFoodPreference(foodId, foodName) {
    console.log('Editing preference for food:', foodName, 'ID:', foodId);
    
    const rating = appState.currentChild.foodPreferences[foodId] || 0;
    
    // Simple rating selection (similar to questionnaire)
    const ratingHtml = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 30px; border-radius: 10px; 
                    box-shadow: 0 5px 25px rgba(0,0,0,0.3); z-index: 1000; min-width: 300px; text-align: center;">
            <h3>${foodName}</h3>
            <p style="color: #666; margin: 15px 0;">How much does ${appState.currentChild.name} like it?</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
                <button onclick="saveFoodPreference(${foodId}, 1)" style="padding: 10px 15px; font-size: 1.2rem; border: none; cursor: pointer; background: #f5f5f5; border-radius: 8px;">😢 1</button>
                <button onclick="saveFoodPreference(${foodId}, 2)" style="padding: 10px 15px; font-size: 1.2rem; border: none; cursor: pointer; background: #f5f5f5; border-radius: 8px;">😐 2</button>
                <button onclick="saveFoodPreference(${foodId}, 3)" style="padding: 10px 15px; font-size: 1.2rem; border: none; cursor: pointer; background: #f5f5f5; border-radius: 8px;">🙂 3</button>
                <button onclick="saveFoodPreference(${foodId}, 4)" style="padding: 10px 15px; font-size: 1.2rem; border: none; cursor: pointer; background: #f5f5f5; border-radius: 8px;">😊 4</button>
                <button onclick="saveFoodPreference(${foodId}, 5)" style="padding: 10px 15px; font-size: 1.2rem; border: none; cursor: pointer; background: #f5f5f5; border-radius: 8px;">😍 5</button>
                <button onclick="saveFoodPreference(${foodId}, 0)" style="padding: 10px 15px; font-size: 1rem; border: none; cursor: pointer; background: #f5f5f5; border-radius: 8px;">Clear</button>
            </div>
            <button onclick="closePreferenceEditor()" style="padding: 10px 20px; background: #888; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
        </div>
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 999;" onclick="closePreferenceEditor()"></div>
    `;
    
    // Add to page
    let modal = document.getElementById('preferencesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'preferencesModal';
        document.body.appendChild(modal);
    }
    modal.innerHTML = ratingHtml;
}

function saveFoodPreference(foodId, rating) {
    console.log('Saving preference - food:', foodId, 'rating:', rating);
    
    if (!appState.currentChild || !appState.currentChild.user_id) {
        alert('No child selected');
        return;
    }
    
    // Update local state
    if (rating === 0) {
        delete appState.currentChild.foodPreferences[foodId];
    } else {
        appState.currentChild.foodPreferences[foodId] = rating;
    }
    
    // Save to database via API
    const preferences = appState.currentChild.foodPreferences;
    
    fetch('../../backend/api/index.php?action=save_food_preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            child_id: appState.currentChild.user_id,
            preferences: preferences
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('Save preference response:', data);
        if (data.success) {
            console.log('✅ Preference saved');
            showFoodPreferences();  // Refresh display
        } else {
            alert('Error: ' + (data.message || 'Failed to save'));
        }
    })
    .catch(error => {
        console.error('Error saving preference:', error);
        alert('Connection error');
    });
    
    closePreferenceEditor();
}

function closePreferenceEditor() {
    const modal = document.getElementById('preferencesModal');
    if (modal) {
        modal.innerHTML = '';
    }
}

// ============================================
// TODAY'S STATS
// ============================================

function loadTodayStats() {
    console.log('Loading today stats...');

    const today = new Date().toISOString().split('T')[0];
    const todayMeals = appState.meals.filter(m => m.meal_date === today);
    
    console.log('Today:', today);
    console.log('Today meals:', todayMeals.length);

    const statsDiv = document.getElementById('todayStats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${todayMeals.length}</div>
                    <div class="stat-label">Meals Today</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${todayMeals.length * 5}</div>
                    <div class="stat-label">Points Earned</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${appState.meals.length}</div>
                    <div class="stat-label">Total Meals</div>
                </div>
            </div>
        `;
    }
}

// ============================================
// MEAL PLAN GENERATION (Claude AI)
// ============================================

function generateMealPlan() {
    console.log('Generating meal plan with Claude AI...');

    alert('🤖 Generating personalized meal plan...\n\n(Claude API integration - requires API key in config.php)\n\nThis feature will create a custom meal plan based on:\n- Food preferences\n- Allergies\n- Health goals\n- Daily calorie target');
}

// ============================================
// GLOBAL EXPORTS
// ============================================

window.showScreen = showScreen;
window.selectChild = selectChild;
window.showMealLogging = showMealLogging;
window.closeModal = closeModal;
window.generateMealPlan = generateMealPlan;
window.completeQuestionnaire = completeQuestionnaire;
window.showFoodPreferences = showFoodPreferences;
window.editFoodPreference = editFoodPreference;
window.saveFoodPreference = saveFoodPreference;
window.closePreferenceEditor = closePreferenceEditor;
window.showManageFoods = showManageFoods;
window.deleteFood = deleteFood;
window.handleSuggestFood = handleSuggestFood;
window.handleConfirmFood = handleConfirmFood;
window.handleRejectSuggestion = handleRejectSuggestion;

console.log('=== NutraKids App Ready ===');
