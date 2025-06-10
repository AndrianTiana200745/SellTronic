<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$productId = isset($_GET['id']) ? $_GET['id'] : null;
$category = isset($_GET['category']) ? $_GET['category'] : null;

switch ($method) {
    case 'GET':
        if ($productId) {
            getProduct($productId);
        } else if ($category) {
            getProductsByCategory($category);
        } else {
            getAllProducts();
        }
        break;
        
    case 'POST':
        requireAuth('admin');
        createProduct();
        break;
        
    case 'PUT':
        requireAuth('admin');
        if (!$productId) {
            sendError('Product ID is required', 400);
        }
        updateProduct($productId);
        break;
        
    case 'DELETE':
        requireAuth('admin');
        if (!$productId) {
            sendError('Product ID is required', 400);
        }
        deleteProduct($productId);
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function getAllProducts() {
    global $pdo;
    
    $stmt = $pdo->query('SELECT * FROM products');
    $products = $stmt->fetchAll();
    
    sendResponse($products);
}

function getProduct($id) {
    global $pdo;
    
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        sendError('Product not found', 404);
    }
    
    sendResponse($product);
}

function getProductsByCategory($categoryId) {
    global $pdo;
    
    $stmt = $pdo->prepare('SELECT * FROM products WHERE category_id = ?');
    $stmt->execute([$categoryId]);
    $products = $stmt->fetchAll();
    
    sendResponse($products);
}

function createProduct() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name']) || !isset($data['price']) || !isset($data['category_id'])) {
        sendError('Name, price, and category are required');
    }
    
    // Generate slug from name
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['name'])));
    
    $stmt = $pdo->prepare('INSERT INTO products (name, slug, description, price, stock, image, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $data['name'],
        $slug,
        $data['description'] ?? '',
        $data['price'],
        $data['stock'] ?? 0,
        $data['image'] ?? '',
        $data['category_id']
    ]);
    
    $productId = $pdo->lastInsertId();
    
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    
    sendResponse($product, 201);
}

function updateProduct($id) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if product exists
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        sendError('Product not found', 404);
    }
    
    // Build update query dynamically based on provided fields
    $fields = [];
    $values = [];
    
    if (isset($data['name'])) {
        $fields[] = 'name = ?';
        $values[] = $data['name'];
        
        // Update slug when name changes
        $fields[] = 'slug = ?';
        $values[] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['name'])));
    }
    
    if (isset($data['description'])) {
        $fields[] = 'description = ?';
        $values[] = $data['description'];
    }
    
    if (isset($data['price'])) {
        $fields[] = 'price = ?';
        $values[] = $data['price'];
    }
    
    if (isset($data['stock'])) {
        $fields[] = 'stock = ?';
        $values[] = $data['stock'];
    }
    
    if (isset($data['image'])) {
        $fields[] = 'image = ?';
        $values[] = $data['image'];
    }
    
    if (isset($data['category_id'])) {
        $fields[] = 'category_id = ?';
        $values[] = $data['category_id'];
    }
    
    if (empty($fields)) {
        sendError('No fields to update', 400);
    }
    
    $fields[] = 'updated_at = CURRENT_TIMESTAMP';
    
    $sql = 'UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $values[] = $id;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $updatedProduct = $stmt->fetch();
    
    sendResponse($updatedProduct);
}

function deleteProduct($id) {
    global $pdo;
    
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        sendError('Product not found', 404);
    }
    
    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    
    sendResponse(['message' => 'Product deleted successfully']);
}
?>
