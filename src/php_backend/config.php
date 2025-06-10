<?php
// Database Configuration
$db_host = 'localhost';
$db_name = 'selltronic';
$db_user = 'root'; // Change to your database username
$db_pass = ''; // Change to your database password

// Application Configuration
$app_url = 'http://localhost/selltronic'; // Change to your domain
$jwt_secret = 'your-secret-key-change-this'; // Change this to a secure random string
$jwt_expiry = 86400; // 24 hours in seconds

// Connect to Database
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Helper Functions
function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function sendError($message, $status = 400) {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

// Authentication Functions
function generateJWT($user) {
    global $jwt_secret, $jwt_expiry;
    
    $issued_at = time();
    $expiration = $issued_at + $jwt_expiry;
    
    $payload = [
        'iat' => $issued_at,
        'exp' => $expiration,
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role']
    ];
    
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode($payload));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", $jwt_secret, true));
    
    return "$header.$payload.$signature";
}

function verifyJWT() {
    global $jwt_secret;
    
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        return null;
    }
    
    $authHeader = $headers['Authorization'];
    $token = str_replace('Bearer ', '', $authHeader);
    
    $tokenParts = explode('.', $token);
    if (count($tokenParts) != 3) {
        return null;
    }
    
    $header = base64_decode($tokenParts[0]);
    $payload = base64_decode($tokenParts[1]);
    $signature = $tokenParts[2];
    
    $verifySignature = base64_encode(hash_hmac('sha256', "$tokenParts[0].$tokenParts[1]", $jwt_secret, true));
    
    if ($signature !== $verifySignature) {
        return null;
    }
    
    $payload = json_decode($payload, true);
    if ($payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

function requireAuth($requiredRole = null) {
    $user = verifyJWT();
    
    if (!$user) {
        sendError('Unauthorized: Invalid or expired token', 401);
    }
    
    if ($requiredRole && $user['role'] !== $requiredRole) {
        sendError('Forbidden: Insufficient permissions', 403);
    }
    
    return $user;
}
?>
