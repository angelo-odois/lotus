<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }
    
    // Validate required fields
    if (!isset($data['pdfBase64']) || !isset($data['filename']) || !isset($data['clientData'])) {
        throw new Exception('Missing required fields: pdfBase64, filename, clientData');
    }
    
    $pdfBase64 = $data['pdfBase64'];
    $filename = $data['filename'];
    $clientData = $data['clientData'];
    
    // Remove data URL prefix if present
    if (strpos($pdfBase64, 'data:application/pdf;base64,') === 0) {
        $pdfBase64 = substr($pdfBase64, strlen('data:application/pdf;base64,'));
    }
    
    // Decode base64
    $pdfContent = base64_decode($pdfBase64);
    if ($pdfContent === false) {
        throw new Exception('Invalid base64 PDF data');
    }
    
    // Create folder structure
    $currentDate = new DateTime();
    $numeroProsposta = 'LP' . $currentDate->format('YmdHi');
    $clientName = isset($clientData['nome']) ? 
        preg_replace('/[^a-zA-Z0-9\-_]/', '-', strtolower($clientData['nome'])) : 
        'cliente';
    
    $folderName = $numeroProsposta . '-' . $clientName;
    $propostalFolder = __DIR__ . '/propostas/' . $folderName;
    
    // Create directory if it doesn't exist
    if (!is_dir($propostalFolder)) {
        if (!mkdir($propostalFolder, 0755, true)) {
            throw new Exception('Failed to create directory: ' . $propostalFolder);
        }
    }
    
    // Save PDF file
    $pdfPath = $propostalFolder . '/' . $filename;
    if (file_put_contents($pdfPath, $pdfContent) === false) {
        throw new Exception('Failed to save PDF file');
    }
    
    // Save client data as JSON
    $jsonPath = $propostalFolder . '/dados-proposta.json';
    $fullClientData = array_merge($clientData, [
        'numeroProsposta' => $numeroProsposta,
        'dataGeracao' => $currentDate->format('Y-m-d H:i:s'),
        'timestamp' => time(),
        'nomeArquivoPDF' => $filename,
        'caminhoCompleto' => $pdfPath
    ]);
    
    if (file_put_contents($jsonPath, json_encode($fullClientData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
        throw new Exception('Failed to save client data JSON');
    }
    
    // Create success response
    $response = [
        'success' => true,
        'message' => 'PDF saved successfully',
        'numeroProsposta' => $numeroProsposta,
        'folderPath' => $folderName,
        'pdfPath' => $pdfPath,
        'jsonPath' => $jsonPath,
        'fileSize' => strlen($pdfContent),
        'timestamp' => $currentDate->format('Y-m-d H:i:s')
    ];
    
    http_response_code(200);
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>