<?php
// Mock Corbit gateway: records every request and answers success.
$entry = ['method' => $_SERVER['REQUEST_METHOD'], 'uri' => $_SERVER['REQUEST_URI'], 'auth' => $_SERVER['HTTP_AUTHORIZATION'] ?? '', 'body' => json_decode(file_get_contents('php://input'), true)];
file_put_contents(__DIR__ . '/requests.jsonl', json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
header('Content-Type: application/json');
if (($_SERVER['HTTP_AUTHORIZATION'] ?? '') === 'Bearer bad-key') { http_response_code(401); echo json_encode(['success' => false, 'message' => 'Invalid API key']); exit; }
echo json_encode(strpos($_SERVER['REQUEST_URI'], 'balance') !== false ? ['success' => true, 'balance' => 1234] : ['success' => true, 'message' => 'Queued']);
