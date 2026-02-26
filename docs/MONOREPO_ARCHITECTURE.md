# 🥗 NutraKids - Monorepo Architecture

**A unified codebase for multiple apps sharing a common backend**

---

## 📁 Project Structure

```
nutrakids/
│
├── backend/                    ← Shared by ALL apps (PHP)
│   ├── api/
│   │   └── index.php          (All endpoints)
│   ├── includes/
│   │   ├── Database.php
│   │   ├── FoodSearch.php
│   │   ├── ClaudeAIService.php
│   │   └── ...
│   ├── config/
│   │   └── config.php         (Shared config)
│   ├── database/
│   │   ├── schema.sql
│   │   └── SQL migrations
│   ├── logs/
│   │   └── error logs
│   └── sessions/
│       └── PHP sessions
│
├── parent-app/                 ← Parental Control App (Web)
│   └── public/
│       ├── index.html         (Parent screens only)
│       ├── css/styles.css     (Parent styling)
│       ├── js/app.js          (Parent logic)
│       └── ...
│
├── child-app/                  ← Child App (Web) - NEW!
│   └── public/
│       ├── index.html         (Child screens only)
│       ├── css/styles.css     (Kid-friendly styling)
│       ├── js/app.js          (Child logic)
│       └── ...
│
├── docs/
│   ├── ARCHITECTURE.md        (This file)
│   ├── API.md                 (API endpoints)
│   ├── SETUP.md               (Setup guide)
│   └── ...
│
└── README.md
```

---

## 🔌 Connection Architecture

### **Both Apps Share Backend**

```
parent-app/public/js/app.js
    ↓
    fetch('../../../api/index.php?action=add_food')
    ↓
backend/api/index.php
    ↓
backend/includes/Database.php (shared)

child-app/public/js/app.js
    ↓
    fetch('../../../api/index.php?action=log_meal')
    ↓
backend/api/index.php
    ↓
backend/includes/Database.php (shared)
```

### **URL Paths**

```
Local Development:
- Parent App: http://localhost/nutrakids/parent-app/public/
- Child App:  http://localhost/nutrakids/child-app/public/
- API:        http://localhost/nutrakids/api/index.php
- Config:     http://localhost/nutrakids/config/config.php

Production (same structure):
- Parent App: https://nutrakids.com/parent-app/public/
- Child App:  https://nutrakids.com/child-app/public/
- API:        https://nutrakids.com/api/index.php
```

---

## 📱 Future Evolution

### **Stage 1: Current (Web Apps)**
```
nutrakids/ (monorepo)
├── backend/
├── parent-app/ (web)
└── child-app/ (web)
```

### **Stage 2: Mobile Apps**
```
nutrakids/ (monorepo)
├── backend/        ← Can be deployed to cloud API
├── parent-app/     ← Web version
├── parent-mobile/  ← React Native/Flutter
├── child-app/      ← Web version
└── child-mobile/   ← React Native/Flutter
```

### **Stage 3: Microservices (if needed)**
```
Split into separate repos:
- nutrakids-backend (API server)
- nutrakids-parent (web + mobile)
- nutrakids-child (web + mobile)
```

---

## 🚀 Deployment Strategy

### **Development**
```bash
cd nutrakids
# Everything runs locally
# parent-app calls /api/index.php
# child-app calls /api/index.php
```

### **Production - Option A: Same Server**
```
Server: api.nutrakids.com
- /api/index.php
- /config/
- /includes/
- /backend/

Server: parent.nutrakids.com
- /parent-app/public/

Server: child.nutrakids.com
- /child-app/public/

All call: http://api.nutrakids.com/api/index.php
```

### **Production - Option B: Single Domain**
```
Server: nutrakids.com
- /api/index.php
- /config/
- /includes/
- /backend/
- /parent-app/public/
- /child-app/public/

Parent App calls: ../../../api/index.php
Child App calls:  ../../../api/index.php
```

---

## 🔑 Key Advantages

| Feature | Benefit |
|---------|---------|
| **Single Backend** | No code duplication |
| **Shared Classes** | Database, Auth, etc. reused |
| **Independent Frontends** | Different designs for different users |
| **Easy to Split** | Can become microservices later |
| **Version Control** | One git repo, easier tracking |
| **Deployment** | Can deploy apps independently |
| **Scaling** | Can scale parts separately |

---

## 🔄 API Usage

### **Both Apps Use Same Endpoints**

```javascript
// parent-app/js/app.js
fetch('../../../api/index.php?action=get_children')

// child-app/js/app.js  
fetch('../../../api/index.php?action=log_meal')

// Same API, different requests
```

### **Backend Handles Both**

```php
// backend/api/index.php
if ($action === 'get_children') {
    // Parent app uses this
}
else if ($action === 'log_meal') {
    // Child app uses this
}
```

---

## 📋 Development Workflow

### **To add a feature to parent app:**
```bash
cd nutrakids/parent-app/
# Edit public/index.html
# Edit public/js/app.js
# Edit public/css/styles.css
# Test locally
```

### **To add a feature to child app:**
```bash
cd nutrakids/child-app/
# Edit public/index.html
# Edit public/js/app.js
# Edit public/css/styles.css
# Test locally
```

### **To update backend (used by both):**
```bash
cd nutrakids/backend/
# OR edit api/index.php
# OR edit includes/Database.php
# Test with both apps
```

---

## 🧪 Testing

```bash
# Test parent app
Open: http://localhost/nutrakids/parent-app/public/
Login as parent
Verify features work

# Test child app
Open: http://localhost/nutrakids/child-app/public/
Login as child
Verify features work

# Test API
curl http://localhost/nutrakids/api/index.php?action=auth_check
Verify endpoints respond
```

---

## 🚨 Important Notes

1. **Relative Paths:** Both apps use `../../../api/` to call backend
2. **Config Access:** Both apps access `../../../config/config.php`
3. **Sessions:** Both apps use same session directory
4. **Database:** Both apps share same database
5. **Dependencies:** Make sure PHP is configured for both paths

---

## 📚 Related Docs

- `SETUP.md` - How to set up the monorepo
- `API.md` - Available API endpoints
- `PARENT-APP.md` - Parent app documentation
- `CHILD-APP.md` - Child app documentation

---

**This architecture supports your vision of separate apps with shared backend!** 🎯
