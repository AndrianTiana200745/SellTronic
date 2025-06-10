<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$categoryId = isset($_GET['id']) ? $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($categoryId) {
            getCategory($categoryId);
        } else {
            getCategories();
        }
        break;
        
    case 'POST':
        requireAuth('admin');
        createCategory();
        break;
        
    case 'PUT':
        requireAuth('admin');
        updateCategory($categoryId);
        break;
        
    case 'DELETE':
        requireAuth('admin');
        deleteCategory($categoryId);
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function getCategories() {
    global $pdo;
    
    $stmt = $pdo->query('SELECT * FROM categories');
    $categories = $stmt->fetchAll();
    
    sendResponse($categories);
}

function getCategory($id) {
    global $pdo;
    
    $stmt = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$id]);
    $category = $stmt->fetch();
    
    if (!$category) {
        sendError('Category not found', 404);
    }
    
    // Get products in this category
    $stmt = $pdo->prepare('SELECT * FROM products WHERE category_id = ?');
    $stmt->execute([$id]);
    $category['products'] = $stmt->fetchAll();
    
    sendResponse($category);
}

function createCategory() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name'])) {
        sendError('Name is required');
    }
    
    // Generate slug from name
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['name'])));
    
    // Check if slug exists
    $stmt = $pdo->prepare('SELECT * FROM categories WHERE slug = ?');
    $stmt->execute([$slug]);
    if ($stmt->fetch()) {
        sendError('Category with this name already exists');
    }
    
    $stmt = $pdo->prepare('INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)');
    $stmt->execute([
        $data['name'],
        $slug,
        $data['image'] ?? null
    ]);
    
    $categoryId = $pdo->lastInsertId();
    
    $stmt = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    
    sendResponse($category, 201);
}

function updateCategory($id) {
    global $pdo;
    
    if (!$id) {
        sendError('Category ID is required', 400);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if category exists
    $stmt = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$id]);
    $category = $stmt->fetch();
    
    if (!$category) {
        sendError('Category not found', 404);
    }
    
    // Build update query dynamically based on provided fields
    $fields = [];
    $values = [];
    
    if (isset($data['name'])) {
        $fields[] = 'name = ?';
        $values[] = $data['name'];
        
        // Update slug when name changes
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['name'])));
        $fields[] = 'slug = ?';
        $values[] = $slug;
        
        // Check if new slug would conflict with existing category
        $stmt = $pdo->prepare('SELECT * FROM categories WHERE slug = ? AND id != ?');
        $stmt->execute([$slug, $id]);
        if ($stmt->fetch()) {
            sendError('Category with this name already exists');
        }
    }
    
    if (isset($data['image'])) {
        $fields[] = 'image = ?';
        $values[] = $data['image'];
    }
    
    if (empty($fields)) {
        sendError('No fields to update', 400);
    }
    
    $fields[] = 'updated_at = CURRENT_TIMESTAMP';
    
    $sql = 'UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $values[] = $id;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    $stmt = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$id]);
    $updatedCategory = $stmt->fetch();
    
    sendResponse($updatedCategory);
}

function deleteCategory($id) {
    global $pdo;
    
    // Check if category exists
    $stmt = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$id]);
    $category = $stmt->fetch();
    
    if (!$category) {
        sendError('Category not found', 404);
    }
    
    // Check if category has products
    $stmt = $pdo->prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?');
    $stmt->execute([$id]);
    $result = $stmt->fetch();
    
    if ($result['count'] > 0) {
        sendError('Cannot delete category with associated products', 400);
    }
    
    $stmt = $pdo->prepare('DELETE FROM categories WHERE id = ?');
    $stmt->execute([$id]);
    
    sendResponse(['message' => 'Category deleted successfully']);
}
?>
