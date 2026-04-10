<?php
require_once __DIR__ . '/../config/db.php';

$clientId = $_GET['clientId'] ?? null;

if (!$clientId) {
    http_response_code(400);
    echo json_encode(['error' => 'clientId required']);
    exit;
}

try {
    // Get the latest ACTIVE or PENDING conversation for this client (skip closed)
    $stmt = $pdo->prepare('SELECT id, status, created_at, updated_at FROM chat_conversations WHERE client_id = ? AND status != "closed" ORDER BY updated_at DESC LIMIT 1');
    $stmt->execute([$clientId]);
    $conversation = $stmt->fetch(PDO::FETCH_ASSOC);

    $result = [];
    if ($conversation) {
        $messagesStmt = $pdo->prepare('SELECT id, message_text, sender, timestamp FROM chat_messages WHERE conversation_id = ? ORDER BY timestamp ASC');
        $messagesStmt->execute([$conversation['id']]);
        $messages = $messagesStmt->fetchAll(PDO::FETCH_ASSOC);

        $result[$clientId] = [
            'status' => $conversation['status'],
            'messages' => array_map(function($msg) {
                return [
                    'id' => $msg['id'],
                    'text' => $msg['message_text'],
                    'who' => $msg['sender'],
                    'timestamp' => (int)$msg['timestamp']
                ];
            }, $messages),
            'createdAt' => strtotime($conversation['created_at']) * 1000,
            'updatedAt' => strtotime($conversation['updated_at']) * 1000
        ];
    }

    echo json_encode([
        'success' => true,
        'conversations' => $result
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
