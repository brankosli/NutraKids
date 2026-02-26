<?php
/**
 * Password Hash Generator
 * Use this to create a valid bcrypt hash for testing
 * 
 * Usage:
 * 1. Save this file as generate_password.php in your NutraKids-App folder
 * 2. Open in browser: http://localhost/NutraKids-App/generate_password.php
 * 3. Enter your desired password
 * 4. Copy the hash
 * 5. Update database with the hash
 */

$generated_hash = null;
$password_input = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password_input = $_POST['password'] ?? '';
    
    if (!empty($password_input)) {
        $generated_hash = password_hash($password_input, PASSWORD_BCRYPT);
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NutraKids - Password Hash Generator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #333;
        }
        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            font-family: monospace;
        }
        input[type="text"]:focus, input[type="password"]:focus {
            outline: none;
            border-color: #4CAF50;
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
        }
        button {
            width: 100%;
            padding: 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        button:hover {
            background: #388E3C;
        }
        .result {
            margin-top: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 4px;
            border-left: 4px solid #4CAF50;
        }
        .result h3 {
            color: #4CAF50;
            margin-bottom: 10px;
            font-size: 1rem;
        }
        .hash-output {
            background: white;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-family: monospace;
            font-size: 0.9rem;
            word-break: break-all;
            margin-bottom: 15px;
        }
        .copy-btn {
            background: #2196F3;
            width: auto;
            padding: 8px 16px;
            font-size: 0.9rem;
        }
        .copy-btn:hover {
            background: #1976d2;
        }
        .instructions {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            border-left: 4px solid #2196F3;
            color: #333;
            font-size: 0.95rem;
            line-height: 1.6;
        }
        .instructions h4 {
            color: #1976d2;
            margin-bottom: 10px;
        }
        code {
            background: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            color: #d32f2f;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Password Hash Generator</h1>
        
        <form method="POST">
            <div class="form-group">
                <label for="password">Enter Password:</label>
                <input type="password" id="password" name="password" placeholder="Enter your desired password" required>
            </div>
            
            <button type="submit">Generate Hash</button>
        </form>

        <?php if ($generated_hash): ?>
        <div class="result">
            <h3>✅ Hash Generated Successfully</h3>
            
            <p style="margin-bottom: 10px;"><strong>Password:</strong> <code><?php echo htmlspecialchars($password_input); ?></code></p>
            <p style="margin-bottom: 10px;"><strong>Hash:</strong></p>
            <div class="hash-output"><?php echo htmlspecialchars($generated_hash); ?></div>
            
            <button class="copy-btn" onclick="copyHash()">📋 Copy Hash</button>
            
            <div class="instructions">
                <h4>Next Steps:</h4>
                <ol style="margin-left: 20px;">
                    <li>Copy the hash above</li>
                    <li>Run this SQL command in MySQL:
                        <pre style="background: white; padding: 10px; border-radius: 3px; margin-top: 8px; overflow-x: auto;">
UPDATE users 
SET password_hash = '<?php echo htmlspecialchars($generated_hash); ?>'
WHERE email = 'parent@test.com';</pre>
                    </li>
                    <li>Or use this simpler command:
                        <pre style="background: white; padding: 10px; border-radius: 3px; margin-top: 8px; overflow-x: auto;">
mysql -u root -p -e "UPDATE nutrakids.users SET password_hash = '<?php echo htmlspecialchars($generated_hash); ?>' WHERE email = 'parent@test.com';"</pre>
                    </li>
                    <li>Refresh the app and try logging in with password: <code><?php echo htmlspecialchars($password_input); ?></code></li>
                </ol>
            </div>
        </div>
        <?php endif; ?>

        <div class="instructions">
            <h4>ℹ️ How This Works:</h4>
            <p>This tool generates a bcrypt hash of your password. Use the hash in your database so that when you log in, the system can verify your password is correct.</p>
            <p style="margin-top: 10px;"><strong>Test Credentials:</strong></p>
            <ul style="margin-left: 20px; margin-top: 8px;">
                <li>Email: <code>parent@test.com</code></li>
                <li>Password: <code>password123</code> (or your custom one)</li>
            </ul>
        </div>
    </div>

    <script>
        function copyHash() {
            const hash = document.querySelector('.hash-output').textContent;
            navigator.clipboard.writeText(hash).then(() => {
                alert('Hash copied to clipboard! ✅');
            }).catch(() => {
                // Fallback for older browsers
                const elem = document.querySelector('.hash-output');
                const range = document.createRange();
                range.selectNodeContents(elem);
                window.getSelection().addRange(range);
                document.execCommand('copy');
                alert('Hash copied to clipboard! ✅');
            });
        }
    </script>
</body>
</html>