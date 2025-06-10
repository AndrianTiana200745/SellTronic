<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'POST':
        if ($action === 'login') {
            handleLogin();
        } elseif ($action === 'register') {
            handleRegister();
        } else {
            sendError('Invalid action', 400);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function handleLogin() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password']) || !isset($data['role'])) {
        sendError('Email, password, and role are required');
    }
    
    $email = $data['email'];
    $password = $data['password'];
    $role = $data['role'];
    
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? AND role = ?');
    $stmt->execute([$email, $role]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        sendError('Invalid email or password', 401);
    }
    
    $token = generateJWT($user);
    
    // Remove sensitive data
    unset($user['password']);
    
    sendResponse([
        'token' => $token,
        'user' => $user
    ]);
}

function handleRegister() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        sendError('Name, email, and password are required');
    }
    
    $name = $data['name'];
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    $role = 'buyer'; // Default role for registration is buyer
    
    // Check if email already exists
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('Email already in use');
    }
    
    // Insert new user
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, $email, $password, $role]);
    
    $userId = $pdo->lastInsertId();
    
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    $token = generateJWT($user);
    
    // Remove sensitive data
    unset($user['password']);
    
    sendResponse([
        'token' => $token,
        'user' => $user
    ], 201);
}
?>
