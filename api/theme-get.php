<?php
require_once __DIR__ . '/../config/db.php';

$clientId = $_GET['clientId'] ?? null;

if (!$clientId) {
    http_response_code(400);
    echo json_encode(['error' => 'clientId required']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT theme FROM user_preferences WHERE client_id = ?');
    $stmt->execute([$clientId]);
    $result = $stmt->fetch();

    $theme = $result ? $result['theme'] : 'dark';

    echo json_encode([
        'theme' => $theme,
        'success' => true
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
