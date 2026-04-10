<?php
require_once __DIR__ . '/../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$clientId = $input['clientId'] ?? null;
$status = $input['status'] ?? null;

if (!$clientId || !$status) {
    http_response_code(400);
    echo json_encode(['error' => 'clientId and status required']);
    exit;
}

if (!in_array($status, ['pending', 'active', 'closed'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status']);
    exit;
}

try {
    // First, ensure client exists in clients table
    $stmt = $pdo->prepare('SELECT id FROM clients WHERE id = ?');
    $stmt->execute([$clientId]);
    $clientExists = $stmt->fetch();
    
    if (!$clientExists) {
        $stmt = $pdo->prepare('INSERT INTO clients (id) VALUES (?)');
        $stmt->execute([$clientId]);
    }

    $stmt = $pdo->prepare('UPDATE chat_conversations SET status = ?, updated_at = NOW() WHERE client_id = ? ORDER BY created_at DESC LIMIT 1');
    $stmt->execute([$status, $clientId]);

    echo json_encode([
        'success' => true,
        'status' => $status
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

