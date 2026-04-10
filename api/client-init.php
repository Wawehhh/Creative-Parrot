<?php
require_once __DIR__ . '/../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$clientId = $input['clientId'] ?? null;

if (!$clientId) {
    http_response_code(400);
    echo json_encode(['error' => 'clientId required']);
    exit;
}

try {
    // Check if client exists
    $stmt = $pdo->prepare('SELECT id FROM clients WHERE id = ?');
    $stmt->execute([$clientId]);
    $exists = $stmt->fetch();

    if (!$exists) {
        // Create new client
        $stmt = $pdo->prepare('INSERT INTO clients (id) VALUES (?)');
        $stmt->execute([$clientId]);
    }

    // Get or create chat conversation
    $stmt = $pdo->prepare('SELECT id FROM chat_conversations WHERE client_id = ? ORDER BY created_at DESC LIMIT 1');
    $stmt->execute([$clientId]);
    $conversation = $stmt->fetch();

    $conversationId = null;
    if ($conversation) {
        $conversationId = $conversation['id'];
    } else {
        // Create new conversation
        $stmt = $pdo->prepare('INSERT INTO chat_conversations (client_id, status) VALUES (?, "pending")');
        $stmt->execute([$clientId]);
        $conversationId = $pdo->lastInsertId();
    }

    echo json_encode([
        'success' => true,
        'clientId' => $clientId,
        'conversationId' => $conversationId
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
