<?php
require_once __DIR__ . '/../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$clientId = $input['clientId'] ?? null;
$messageText = $input['message'] ?? null;
$sender = $input['sender'] ?? 'client';
$timestamp = $input['timestamp'] ?? (int)(microtime(true) * 1000);

if (!$clientId || !$messageText) {
    http_response_code(400);
    echo json_encode(['error' => 'clientId and message required']);
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

    // Get the latest ACTIVE or PENDING conversation, skip closed ones
    $stmt = $pdo->prepare('SELECT id, status FROM chat_conversations WHERE client_id = ? AND status != "closed" ORDER BY created_at DESC LIMIT 1');
    $stmt->execute([$clientId]);
    $conversation = $stmt->fetch();

    $conversationId = null;
    if ($conversation) {
        $conversationId = $conversation['id'];
    } else {
        // If no active/pending conversation exists, create a new one
        $stmt = $pdo->prepare('INSERT INTO chat_conversations (client_id, status) VALUES (?, "pending")');
        $stmt->execute([$clientId]);
        $conversationId = $pdo->lastInsertId();
    }

    // Insert message
    $messageId = uniqid($timestamp . '-', true);
    $stmt = $pdo->prepare('INSERT INTO chat_messages (conversation_id, message_text, sender, timestamp) VALUES (?, ?, ?, ?)');
    $stmt->execute([$conversationId, $messageText, $sender, $timestamp]);

    // Update conversation timestamp
    $stmt = $pdo->prepare('UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?');
    $stmt->execute([$conversationId]);

    echo json_encode([
        'success' => true,
        'messageId' => $messageId,
        'conversationId' => $conversationId,
        'timestamp' => $timestamp
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
