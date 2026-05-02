<?php
/**
 * E-Obra: Chapter Save Backend
 * Saves the updated chapters.json to the data directory
 */

header('Content-Type: application/json');

// Get the POST data
$jsonData = file_get_contents('php://input');

if (!$jsonData) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

// Validate JSON
$data = json_decode($jsonData);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Save to file
$filePath = '../data/chapters.json';

if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(['success' => true, 'message' => 'Chapters updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to write to file. Check folder permissions.']);
}
?>
