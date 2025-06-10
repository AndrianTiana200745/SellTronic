<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$productId = isset($_GET['product_id']) ? $_GET['product_id'] : null;

switch ($method) {
    case 'GET':
        getFavorites();
        break;
        
    case 'POST':
        addFavorite($productId);
        break;
        
    case 'DELETE':
        removeFavorite($productId);
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function getFavorites() {
    global $pdo;
    
    $user = requireAuth('buyer');
    $userId = $user['user_id'];
    
    $stmt = $pdo->prepare('
        SELECT p.* 
        FROM favorites f
        JOIN products p ON f.product_id = p.id
        WHERE f.user_id = ?
    ');
    $stmt->execute([$userId]);
    $favorites = $stmt->fetchAll();
    
    sendResponse($favorites);
}

function addFavorite($productId) {
    global $pdo;
    
    if (!$productId) {
        sendError('Product ID is required', 400);
    }
    
    $user = requireAuth('buyer');
    $userId = $user['user_id'];
    
    // Check if product exists
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$productId]);
    if (!$stmt->fetch()) {
        sendError('Product not found', 404);
    }
    
    // Check if already in favorites
    $stmt = $pdo->prepare('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?');
    $stmt->execute([$userId, $productId]);
    if ($stmt->fetch()) {
        sendError('Product already in favorites', 400);
    }
    
    // Add to favorites
    $stmt = $pdo->prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)');
    $stmt->execute([$userId, $productId]);
    
    sendResponse(['message' => 'Product added to favorites']);
}

function removeFavorite($productId) {
    global $pdo;
    
    if (!$productId) {
        sendError('Product ID is required', 400);
    }
    
    $user = requireAuth('buyer');
    $userId = $user['user_id'];
    
    $stmt = $pdo->prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?');
    $stmt->execute([$userId, $productId]);
    
    if ($stmt->rowCount() === 0) {
        sendError('Product not found in favorites', 404);
    }
    
    sendResponse(['message' => 'Product removed from favorites']);
}
?>
