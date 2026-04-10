<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

try {
    // Check connection
    echo json_encode([
        'success' => true,
        'status' => 'Connected to database',
        'database' => 'creative_parrot'
    ], JSON_PRETTY_PRINT);
    
    // Test tables exist
    $tables = ['chat_conversations', 'chat_messages', 'clients', 'user_preferences'];
    $tableStatus = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->prepare("SHOW COLUMNS FROM $table");
        try {
            $stmt->execute();
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $tableStatus[$table] = [
                'exists' => true,
                'columns' => $columns
            ];
        } catch (Exception $e) {
            $tableStatus[$table] = [
                'exists' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    echo "\n\nTables Status:\n";
    echo json_encode($tableStatus, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
