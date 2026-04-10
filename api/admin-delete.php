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
    // Get the conversation ID
    $stmt = $pdo->prepare('SELECT id FROM chat_conversations WHERE client_id = ? ORDER BY created_at DESC LIMIT 1');
    $stmt->execute([$clientId]);
    $conversation = $stmt->fetch();

    if (!$conversation) {
        http_response_code(404);
        echo json_encode(['error' => 'Conversation not found']);
        exit;
    }

    $conversationId = $conversation['id'];

    // Delete all messages for this conversation
    $stmt = $pdo->prepare('DELETE FROM chat_messages WHERE conversation_id = ?');
    $stmt->execute([$conversationId]);

    // Delete the conversation
    $stmt = $pdo->prepare('DELETE FROM chat_conversations WHERE id = ?');
    $stmt->execute([$conversationId]);

    echo json_encode([
        'success' => true,
        'message' => 'Conversation deleted successfully'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
