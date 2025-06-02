<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = isset($_GET['id']) ? $_GET['id'] : null;
$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($method) {
    case 'GET':
        if ($userId) {
            getUser($userId);
        } else {
            getUsers();
        }
        break;
        
    case 'PUT':
        if ($action === 'add-funds') {
            addFunds();
        } else {
            updateUser($userId);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function getUsers() {
    global $pdo;
    
    // Only admin can view all users
    requireAuth('admin');
    
    $stmt = $pdo->query('SELECT id, name, email, role, balance, created_at FROM users');
    $users = $stmt->fetchAll();
    
    sendResponse($users);
}

function getUser($id) {
    global $pdo;
    
    $user = verifyJWT();
    
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    
    // Admin can view any user, regular users can only view themselves
    if ($user['role'] !== 'admin' && $user['user_id'] != $id) {
        sendError('Forbidden', 403);
    }
    
    $stmt = $pdo->prepare('SELECT id, name, email, role, balance, created_at FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $userData = $stmt->fetch();
    
    if (!$userData) {
        sendError('User not found', 404);
    }
    
    // Get user orders
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$id]);
    $userData['orders'] = $stmt->fetchAll();
    
    sendResponse($userData);
}

function updateUser($id) {
    global $pdo;
    
    $user = verifyJWT();
    
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    
    // Admin can update any user, regular users can only update themselves
    if ($user['role'] !== 'admin' && $user['user_id'] != $id) {
        sendError('Forbidden', 403);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Build update query dynamically based on provided fields
    $fields = [];
    $values = [];
    
    if (isset($data['name'])) {
        $fields[] = 'name = ?';
        $values[] = $data['name'];
    }
    
    if (isset($data['email'])) {
        // Check if email is already taken by another user
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
        $stmt->execute([$data['email'], $id]);
        if ($stmt->fetch()) {
            sendError('Email already in use');
        }
        
        $fields[] = 'email = ?';
        $values[] = $data['email'];
    }
    
    if (isset($data['password'])) {
        $fields[] = 'password = ?';
        $values[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }
    
    // Only admin can change role or balance directly
    if ($user['role'] === 'admin') {
        if (isset($data['role'])) {
            $fields[] = 'role = ?';
            $values[] = $data['role'];
        }
        
        if (isset($data['balance'])) {
            $fields[] = 'balance = ?';
            $values[] = $data['balance'];
        }
    }
    
    if (empty($fields)) {
        sendError('No fields to update', 400);
    }
    
    $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $values[] = $id;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    $stmt = $pdo->prepare('SELECT id, name, email, role, balance, created_at FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $updatedUser = $stmt->fetch();
    
    sendResponse($updatedUser);
}

function addFunds() {
    global $pdo;
    
    $user = requireAuth('buyer');
    $userId = $user['user_id'];
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['amount']) || !is_numeric($data['amount']) || $data['amount'] <= 0) {
        sendError('Valid amount is required');
    }
    
    $amount = $data['amount'];
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Get current balance
        $stmt = $pdo->prepare('SELECT balance FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $userData = $stmt->fetch();
        
        if (!$userData) {
            throw new Exception('User not found');
        }
        
        // Update balance
        $newBalance = $userData['balance'] + $amount;
        $stmt = $pdo->prepare('UPDATE users SET balance = ? WHERE id = ?');
        $stmt->execute([$newBalance, $userId]);
        
        // Record transaction
        $stmt = $pdo->prepare('INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)');
        $stmt->execute([$userId, $amount, 'deposit', 'Account deposit']);
        
        // Commit transaction
        $pdo->commit();
        
        // Get updated user data
        $stmt = $pdo->prepare('SELECT id, name, email, role, balance FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $updatedUser = $stmt->fetch();
        
        sendResponse([
            'user' => $updatedUser,
            'message' => 'Funds added successfully'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}
?>
