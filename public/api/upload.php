<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Ensure the directory exists
$targetDir = "../uploads/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

if (!isset($_FILES['file'])) {
    echo json_encode(["success" => false, "message" => "No file uploaded"]);
    exit;
}

$file = $_FILES['file'];
$fileName = time() . '_' . basename($file['name']);
$targetFilePath = $targetDir . $fileName;

// Basic validation
$fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
$allowTypes = array('jpg', 'png', 'jpeg', 'gif', 'mp4', 'mov', 'avi');

if (in_array($fileType, $allowTypes)) {
    if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
        // Construct the public URL
        // In production, this should be the absolute URL to your domain
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        $fileUrl = $protocol . $host . "/uploads/" . $fileName;
        
        echo json_encode(["success" => true, "url" => $fileUrl]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to move uploaded file"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid file type"]);
}
?>
