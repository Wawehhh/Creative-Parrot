<?php
require_once __DIR__ . '/../config/db.php';

try {
    // Get all pending conversations first, then completed ones
    $stmt = $pdo->prepare('
        SELECT cc.id, cc.client_id, cc.status, cc.created_at, cc.updated_at, 
               COUNT(cm.id) as message_count
        FROM chat_conversations cc
        LEFT JOIN chat_messages cm ON cc.id = cm.conversation_id
        GROUP BY cc.id
        ORDER BY 
            CASE WHEN cc.status = "pending" THEN 0 ELSE 1 END ASC,
            cc.updated_at DESC
    ');
    $stmt->execute();
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($conversations as $conv) {
        $messagesStmt = $pdo->prepare('
            SELECT id, message_text, sender, timestamp 
            FROM chat_messages 
            WHERE conversation_id = ? 
            ORDER BY timestamp ASC
        ');
        $messagesStmt->execute([$conv['id']]);
        $messages = $messagesStmt->fetchAll(PDO::FETCH_ASSOC);

        $result[$conv['client_id']] = [
            'conversationId' => $conv['id'],
            'status' => $conv['status'],
            'messages' => array_map(function($msg) {
                return [
                    'id' => $msg['id'],
                    'text' => $msg['message_text'],
                    'who' => $msg['sender'],
                    'timestamp' => (int)$msg['timestamp']
                ];
            }, $messages),
            'createdAt' => strtotime($conv['created_at']) * 1000,
            'updatedAt' => strtotime($conv['updated_at']) * 1000,
            'messageCount' => (int)$conv['message_count']
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
