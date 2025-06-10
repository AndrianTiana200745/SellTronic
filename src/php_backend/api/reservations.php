<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$reservationId = isset($_GET['id']) ? $_GET['id'] : null;
$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($method) {
    case 'GET':
        if ($reservationId) {
            getReservation($reservationId);
        } else {
            getReservations();
        }
        break;
        
    case 'POST':
        if ($action === 'convert' && $reservationId) {
            convertReservation($reservationId);
        } else {
            createReservation();
        }
        break;
        
    case 'DELETE':
        cancelReservation($reservationId);
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function getReservations() {
    global $pdo;
    
    $user = verifyJWT();
    
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    
    if ($user['role'] === 'admin') {
        // Admin sees all active reservations
        $stmt = $pdo->query('
            SELECT r.*, u.name as user_name, p.name as product_name, p.price, p.image
            FROM reservations r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE r.status = "active"
            ORDER BY r.expiry_date ASC
        ');
    } else {
        // Buyers see only their reservations
        $stmt = $pdo->prepare('
            SELECT r.*, p.name as product_name, p.price, p.image
            FROM reservations r
            JOIN products p ON r.product_id = p.id
            WHERE r.user_id = ? AND r.status = "active"
            ORDER BY r.expiry_date ASC
        ');
        $stmt->execute([$user['user_id']]);
    }
    
    $reservations = $stmt->fetchAll();
    
    sendResponse($reservations);
}

function getReservation($id) {
    global $pdo;
    
    $user = verifyJWT();
    
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    
    $stmt = $pdo->prepare('
        SELECT r.*, p.name as product_name, p.price, p.description, p.image, p.category_id, p.stock
        FROM reservations r
        JOIN products p ON r.product_id = p.id
        WHERE r.id = ?
    ');
    $stmt->execute([$id]);
    $reservation = $stmt->fetch();
    
    if (!$reservation) {
        sendError('Reservation not found', 404);
    }
    
    // Only admin or the reservation owner can view the reservation
    if ($user['role'] !== 'admin' && $user['user_id'] != $reservation['user_id']) {
        sendError('Forbidden', 403);
    }
    
    // Get user info
    $stmt = $pdo->prepare('SELECT id, name, email FROM users WHERE id = ?');
    $stmt->execute([$reservation['user_id']]);
    $reservation['user'] = $stmt->fetch();
    
    sendResponse($reservation);
}

function createReservation() {
    global $pdo;
    
    $user = requireAuth('buyer');
    $userId = $user['user_id'];
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['product_id']) || !isset($data['quantity'])) {
        sendError('Product ID and quantity are required');
    }
    
    $productId = $data['product_id'];
    $quantity = max(1, intval($data['quantity']));
    
    // Check if product exists and has enough stock
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ? AND stock >= ?');
    $stmt->execute([$productId, $quantity]);
    $product = $stmt->fetch();
    
    if (!$product) {
        sendError('Product not found or insufficient stock', 400);
    }
    
    // Check if user already has an active reservation for this product
    $stmt = $pdo->prepare('
        SELECT * FROM reservations 
        WHERE user_id = ? AND product_id = ? AND status = "active"
    ');
    $stmt->execute([$userId, $productId]);
    if ($stmt->fetch()) {
        sendError('You already have an active reservation for this product', 400);
    }
    
    // Set expiry date (default 48 hours)
    $expiryDate = date('Y-m-d H:i:s', strtotime('+48 hours'));
    
    // Create reservation
    $stmt = $pdo->prepare('
        INSERT INTO reservations (user_id, product_id, quantity, expiry_date)
        VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([$userId, $productId, $quantity, $expiryDate]);
    
    $reservationId = $pdo->lastInsertId();
    
    // Temporarily reduce stock
    $newStock = $product['stock'] - $quantity;
    $stmt = $pdo->prepare('UPDATE products SET stock = ? WHERE id = ?');
    $stmt->execute([$newStock, $productId]);
    
    // Get complete reservation
    $stmt = $pdo->prepare('
        SELECT r.*, p.name as product_name, p.price, p.image
        FROM reservations r
        JOIN products p ON r.product_id = p.id
        WHERE r.id = ?
    ');
    $stmt->execute([$reservationId]);
    $reservation = $stmt->fetch();
    
    sendResponse($reservation, 201);
}

function convertReservation($id) {
    global $pdo;
    
    $user = requireAuth('buyer');
    $userId = $user['user_id'];
    
    // Get reservation
    $stmt = $pdo->prepare('
        SELECT r.*, p.price
        FROM reservations r
        JOIN products p ON r.product_id = p.id
        WHERE r.id = ? AND r.user_id = ? AND r.status = "active" AND r.expiry_date > NOW()
    ');
    $stmt->execute([$id, $userId]);
    $reservation = $stmt->fetch();
    
    if (!$reservation) {
        sendError('Reservation not found or expired', 404);
    }
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Get user balance
        $stmt = $pdo->prepare('SELECT balance FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        // Calculate total cost
        $orderTotal = $reservation['price'] * $reservation['quantity'];
        
        // Check user balance
        if ($user['balance'] < $orderTotal) {
            throw new Exception('Insufficient funds');
        }
        
        // Deduct from user balance
        $newBalance = $user['balance'] - $orderTotal;
        $stmt = $pdo->prepare('UPDATE users SET balance = ? WHERE id = ?');
        $stmt->execute([$newBalance, $userId]);
        
        // Create order
        $stmt = $pdo->prepare('INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)');
        $stmt->execute([$userId, $orderTotal, 'pending']);
        $orderId = $pdo->lastInsertId();
        
        // Create order item
        $stmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $orderId, 
            $reservation['product_id'], 
            $reservation['quantity'], 
            $reservation['price']
        ]);
        
        // Update reservation status
        $stmt = $pdo->prepare('UPDATE reservations SET status = ? WHERE id = ?');
        $stmt->execute(['converted', $id]);
        
        // Record transaction
        $stmt = $pdo->prepare('INSERT INTO transactions (user_id, amount, type, description, reference_id) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $userId, 
            -$orderTotal, 
            'purchase', 
            'Purchase from reservation', 
            'reservation-' . $id
        ]);
        
        // Commit transaction
        $pdo->commit();
        
        // Get complete order
        $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        
        // Get order items
        $stmt = $pdo->prepare('
            SELECT oi.*, p.name, p.image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ');
        $stmt->execute([$orderId]);
        $order['items'] = $stmt->fetchAll();
        
        sendResponse([
            'message' => 'Reservation converted to order successfully',
            'order' => $order
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}

function cancelReservation($id) {
    global $pdo;
    
    $user = verifyJWT();
    
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    
    // Get reservation
    $stmt = $pdo->prepare('SELECT * FROM reservations WHERE id = ?');
    $stmt->execute([$id]);
    $reservation = $stmt->fetch();
    
    if (!$reservation) {
        sendError('Reservation not found', 404);
    }
    
    // Only admin or the reservation owner can cancel the reservation
    if ($user['role'] !== 'admin' && $user['user_id'] != $reservation['user_id']) {
        sendError('Forbidden', 403);
    }
    
    // Check if reservation is active
    if ($reservation['status'] !== 'active') {
        sendError('Reservation is not active', 400);
    }
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Update reservation status
        $stmt = $pdo->prepare('UPDATE reservations SET status = ? WHERE id = ?');
        $stmt->execute(['expired', $id]);
        
        // Return stock to product
        $stmt = $pdo->prepare('
            UPDATE products 
            SET stock = stock + ? 
            WHERE id = ?
        ');
        $stmt->execute([
            $reservation['quantity'], 
            $reservation['product_id']
        ]);
        
        // Commit transaction
        $pdo->commit();
        
        sendResponse(['message' => 'Reservation cancelled successfully']);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}
?>
