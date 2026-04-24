<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader OR include PHPMailer files directly
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} elseif (file_exists(__DIR__ . '/PHPMailer/src/Exception.php')) {
    require __DIR__ . '/PHPMailer/src/Exception.php';
    require __DIR__ . '/PHPMailer/src/PHPMailer.php';
    require __DIR__ . '/PHPMailer/src/SMTP.php';
} else {
    echo json_encode([
        "success" => false, 
        "message" => "PHPMailer not found. Please ensure the 'PHPMailer' folder or 'vendor' folder is uploaded to the /api directory on your server."
    ]);
    exit;
}

// Quick check if classes are actually loaded
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    echo json_encode(["success" => false, "message" => "PHPMailer class not found after attempted include."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$type = $input['type'] ?? 'admin_notification'; // 'admin_notification' or 'guest_confirmation'
$email = $input['email'] ?? '';
$fullName = $input['fullName'] ?? 'Guest';
$guestsCount = $input['guestsCount'] ?? 0;
$attendanceDays = $input['attendanceDays'] ?? [];

if (!is_array($attendanceDays)) {
    $attendanceDays = [];
}

$attendanceDayLookup = [
    '2026-06-26' => 'Day 1 - June 26th, 2026 (Exclusive Dublin Tour)',
    '2026-06-27' => 'Day 2 - June 27th, 2026 (Birthday Dinner with Obele)',
    '2026-06-28' => 'Day 3 - June 28th, 2026 (Birthday Thanksgiving Day)',
    'day1' => 'Day 1 - June 26th, 2026 (Exclusive Dublin Tour)',
    'day2' => 'Day 2 - June 27th, 2026 (Birthday Dinner with Obele)',
    'day3' => 'Day 3 - June 28th, 2026 (Birthday Thanksgiving Day)',
];

$normalizedAttendanceDays = [];
foreach ($attendanceDays as $dayKey) {
    if (is_string($dayKey) && isset($attendanceDayLookup[$dayKey])) {
        $normalizedAttendanceDays[$dayKey] = $attendanceDayLookup[$dayKey];
    }
}

if (count($normalizedAttendanceDays) === 0) {
    $normalizedAttendanceDays = ['Not specified'];
} else {
    $normalizedAttendanceDays = array_values($normalizedAttendanceDays);
}

$attendanceListHtml = "<ul style='padding-left: 18px; margin: 8px 0 0;'>";
foreach ($normalizedAttendanceDays as $attendanceDayLabel) {
    $safeLabel = htmlspecialchars($attendanceDayLabel, ENT_QUOTES, 'UTF-8');
    $attendanceListHtml .= "<li style='margin: 4px 0;'>{$safeLabel}</li>";
}
$attendanceListHtml .= "</ul>";

if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Email is required"]);
    exit;
}

// SMTP CONFIGURATION
$smtp_config = [
    'host'     => 'obeleat50.com',     // Your SMTP host
    'username' => 'noreply@obeleat50.com', // SMTP username
    'password' => 'l7yPl^LQVMCV',   // SMTP password
    'port'     => 465,                   // 465 for SSL, 587 for TLS
    'from'     => 'noreply@obeleat50.com',
    'admin'    => 'admin@obeleat50.com'
];

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = $smtp_config['host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp_config['username'];
    $mail->Password   = $smtp_config['password'];
    
    // Constant correction: PHPMailer::ENCRYPTION_SMTPS is the correct constant for SSL on 465
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; 
    $mail->Port       = $smtp_config['port'];

    // Recipients
    $mail->setFrom($smtp_config['from'], 'Obele @ 50');
    
    if ($type === 'admin_notification') {
        $mail->addAddress($smtp_config['admin']);
        $subject = "New RSVP Submission: " . $fullName;
        
        // TEMPLATE 1: ADMIN NOTIFICATION (Sleek/Dashboard style)
        $message = "
        <div style='background: #140309; padding: 40px; font-family: sans-serif; color: #F6F3EE; text-align: center;'>
            <div style='max-width: 500px; margin: 0 auto; border: 1px solid #C7A24B; padding: 30px; border-radius: 20px;'>
                <h1 style='color: #C7A24B; font-family: serif; font-style: italic; margin-bottom: 20px;'>New RSVP</h1>
                <div style='text-align: left; background: rgba(199, 162, 75, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;'>
                    <p style='margin: 10px 0;'><strong>Guest:</strong> {$fullName}</p>
                    <p style='margin: 10px 0;'><strong>Email:</strong> {$email}</p>
                    <p style='margin: 10px 0;'><strong>Guest Count:</strong> {$guestsCount}</p>
                    <p style='margin: 10px 0 2px;'><strong>Attendance Days:</strong></p>
                    {$attendanceListHtml}
                </div>
                <p style='font-size: 14px; opacity: 0.7;'>A new guest is waiting for your approval in the admin dashboard.</p>
                <div style='margin-top: 30px;'>
                    <a href='https://obeleat50.com/admin' style='background: #C7A24B; color: #140309; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; display: inline-block;'>Go to Dashboard</a>
                </div>
            </div>
        </div>";
    } else {
        $mail->addAddress($email, $fullName);
        $subject = "RSVP Confirmed - Fifty Years of Grace";
        
        // TEMPLATE 2: GUEST CONFIRMATION (Premium Invitation style)
        $message = "
        <div style='background: #F6F3EE; padding: 40px; font-family: sans-serif; color: #140309; text-align: center;'>
            <div style='max-width: 500px; margin: 0 auto; border: 2px solid #C7A24B; padding: 40px; border-radius: 2px;'>
                <h1 style='color: #C7A24B; font-family: serif; font-style: italic; font-weight: normal; font-size: 28px;'>You are invited</h1>
                <p style='font-size: 16px; line-height: 1.8; margin: 20px 0;'>Dear {$fullName}, we are absolutely thrilled to confirm your attendance at the 50th birthday celebration of Mrs. Obele Akinniranye.</p>
                <div style='margin: 30px 0; border-top: 1px solid #C7A24B; border-bottom: 1px solid #C7A24B; padding: 20px 0;'>
                    <p style='margin: 5px 0 2px; letter-spacing: 2px; text-transform: uppercase; font-size: 12px;'>Your Selected Celebration Days</p>
                    <div style='text-align: left; max-width: 360px; margin: 0 auto;'>
                        {$attendanceListHtml}
                    </div>
                </div>
                <p style='font-size: 13px; opacity: 0.8;'>Further details regarding the venue and itinerary will be shared soon.</p>
                <p style='margin-top: 40px; font-family: serif; font-style: italic;'>Warm Regards,<br>The Family</p>
            </div>
            <p style='font-size: 11px; margin-top: 20px; opacity: 0.5;'>Fifty Years of Grace @ 2026</p>
        </div>";
    }

    // Content
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $message;

    $mail->send();
    echo json_encode(["success" => true, "message" => "Email sent successfully"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
?>


<!-- 
                <img src='https://obeleat50.com/logo.png' alt='Obele @ 50' style='width: 100px; margin-bottom: 20px;'> -->
