<?php
require_once __DIR__ . '/../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$clientId = $input['clientId'] ?? null;
$theme = $input['theme'] ?? 'dark';

if (!$clientId) {
    http_response_code(400);
    echo json_encode(['error' => 'clientId required']);
    exit;
}

if (!in_array($theme, ['light', 'dark'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid theme']);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO user_preferences (client_id, theme) VALUES (?, ?) ON DUPLICATE KEY UPDATE theme = ?');
    $stmt->execute([$clientId, $theme, $theme]);

    echo json_encode([
        'success' => true,
        'theme' => $theme
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
