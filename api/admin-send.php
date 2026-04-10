<?php
require_once __DIR__ . '/../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$clientId = $input['clientId'] ?? null;
$messageText = $input['message'] ?? null;
$timestamp = $input['timestamp'] ?? (int)(microtime(true) * 1000);

if (!$clientId || !$messageText) {
    http_response_code(400);
    echo json_encode(['error' => 'clientId and message required']);
    exit;
}

try {
    // Get the latest conversation for this client
    $stmt = $pdo->prepare('SELECT id FROM chat_conversations WHERE client_id = ? ORDER BY created_at DESC LIMIT 1');
    $stmt->execute([$clientId]);
    $conversation = $stmt->fetch();

    if (!$conversation) {
        http_response_code(404);
        echo json_encode(['error' => 'No conversation found for this client']);
        exit;
    }

    $conversationId = $conversation['id'];

    // If conversation is pending, auto-set to active when admin replies
    $stmt = $pdo->prepare('SELECT status FROM chat_conversations WHERE id = ?');
    $stmt->execute([$conversationId]);
    $convData = $stmt->fetch();
    
    if ($convData && $convData['status'] === 'pending') {
        $updateStmt = $pdo->prepare('UPDATE chat_conversations SET status = "active", updated_at = NOW() WHERE id = ?');
        $updateStmt->execute([$conversationId]);
    }

    // Insert admin message
    $messageId = uniqid($timestamp . '-', true);
    $stmt = $pdo->prepare('INSERT INTO chat_messages (conversation_id, message_text, sender, timestamp) VALUES (?, ?, ?, ?)');
    $stmt->execute([$conversationId, $messageText, 'admin', $timestamp]);

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
