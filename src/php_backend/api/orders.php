<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$orderId = isset($_GET['id']) ? $_GET['id'] : null;
$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($method) {
    case 'GET':
        if ($orderId) {
            getOrder($orderId);
        } else {
            getOrders();
        }
        break;
        
    case 'POST':
        $user = requireAuth('buyer');
        if ($action === 'deliver' && $orderId) {
            requireAuth('admin');
            deliverOrder($orderId);
        } else {
            createOrder($user['user_id']);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function getOrders() {
    global $pdo;
    
    $user = verifyJWT();
    
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    
    if ($user['role'] === 'admin') {
        // Admin sees all orders
        $stmt = $pdo->query('
            SELECT o.*, u.name as user_name, u.email as user_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        ');
    } else {
        // Buyers see only their orders
        $stmt = $pdo->prepare('
            SELECT * FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        ');
        $stmt->execute([$user['user_id']]);
    }
    
    $orders = $stmt->fetchAll();
    
    // Get order items for each order
    foreach ($orders as &$order) {
        $stmt = $pdo->prepare('
            SELECT oi.*, p.name, p.image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ');
        $stmt->execute([$order['id']]);
        $order['items'] = $stmt->fetchAll();
    }
    
    sendResponse($orders);
}

function getOrder($id) {
    global $pdo;
    
    $user = verifyJWT();
    
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    
    if (!$order) {
        sendError('Order not found', 404);
    }
    
    // Only admin or the order owner can view the order
    if ($user['role'] !== 'admin' && $user['user_id'] != $order['user_id']) {
        sendError('Forbidden', 403);
    }
    
    // Get order items
    $stmt = $pdo->prepare('
        SELECT oi.*, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ');
    $stmt->execute([$id]);
    $order['items'] = $stmt->fetchAll();
    
    // Get user info
    $stmt = $pdo->prepare('SELECT id, name, email FROM users WHERE id = ?');
    $stmt->execute([$order['user_id']]);
    $order['user'] = $stmt->fetch();
    
    sendResponse($order);
}

function createOrder($userId) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['items']) || !is_array($data['items']) || empty($data['items'])) {
        sendError('Order items are required');
    }
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Get user balance
        $stmt = $pdo->prepare('SELECT balance FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            throw new Exception('User not found');
        }
        
        // Calculate order total and check stock
        $orderTotal = 0;
        $items = [];
        
        foreach ($data['items'] as $item) {
            if (!isset($item['id']) || !isset($item['quantity']) || $item['quantity'] <= 0) {
                throw new Exception('Invalid item format');
            }
            
            $stmt = $pdo->prepare('SELECT id, price, stock FROM products WHERE id = ?');
            $stmt->execute([$item['id']]);
            $product = $stmt->fetch();
            
            if (!$product) {
                throw new Exception('Product not found: ' . $item['id']);
            }
            
            if ($product['stock'] < $item['quantity']) {
                throw new Exception('Insufficient stock for product: ' . $item['id']);
            }
            
            $itemTotal = $product['price'] * $item['quantity'];
            $orderTotal += $itemTotal;
            
            $items[] = [
                'product_id' => $product['id'],
                'quantity' => $item['quantity'],
                'price' => $product['price']
            ];
            
            // Update stock
            $newStock = $product['stock'] - $item['quantity'];
            $stmt = $pdo->prepare('UPDATE products SET stock = ? WHERE id = ?');
            $stmt->execute([$newStock, $product['id']]);
        }
        
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
        
        // Create order items
        foreach ($items as $item) {
            $stmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
            $stmt->execute([$orderId, $item['product_id'], $item['quantity'], $item['price']]);
        }
        
        // Record transaction
        $stmt = $pdo->prepare('INSERT INTO transactions (user_id, amount, type, description, reference_id) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$userId, -$orderTotal, 'purchase', 'Purchase payment', 'order-' . $orderId]);
        
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
        
        sendResponse($order, 201);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        sendError($e->getMessage(), 400);
    }
}

function deliverOrder($orderId) {
    global $pdo;
    
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    
    if (!$order) {
        sendError('Order not found', 404);
    }
    
    if ($order['status'] === 'delivered') {
        sendError('Order already delivered', 400);
    }
    
    $stmt = $pdo->prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    $stmt->execute(['delivered', $orderId]);
    
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$orderId]);
    $updatedOrder = $stmt->fetch();
    
    sendResponse($updatedOrder);
}
?>
