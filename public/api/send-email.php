<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

ini_set("display_errors", "1");
ini_set("display_startup_errors", "1");
error_reporting(E_ALL);

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

function jsonResponse(bool $success, string $message, array $extra = []): void
{
    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message,
    ], $extra));
    exit;
}

function loadEnvMap(array $candidatePaths): array
{
    $map = [];

    foreach ($candidatePaths as $path) {
        if (!file_exists($path)) {
            continue;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            continue;
        }

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === "" || str_starts_with($trimmed, "#")) {
                continue;
            }

            $parts = explode("=", $trimmed, 2);
            if (count($parts) !== 2) {
                continue;
            }

            $key = trim($parts[0]);
            $value = trim($parts[1]);

            if ($key === "") {
                continue;
            }

            if (
                (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                (str_starts_with($value, "'") && str_ends_with($value, "'"))
            ) {
                $value = substr($value, 1, -1);
            }

            $map[$key] = $value;
        }
    }

    return $map;
}

function envValue(string $key, array $fileEnv, string $default = ""): string
{
    $value = getenv($key);
    if ($value !== false && $value !== "") {
        return $value;
    }

    if (isset($_ENV[$key]) && $_ENV[$key] !== "") {
        return (string) $_ENV[$key];
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== "") {
        return (string) $_SERVER[$key];
    }

    if (isset($fileEnv[$key]) && $fileEnv[$key] !== "") {
        return (string) $fileEnv[$key];
    }

    return $default;
}

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    jsonResponse(false, "Method not allowed");
}

$fileEnv = loadEnvMap([
    __DIR__ . "/../../.env",
    __DIR__ . "/../.env",
    __DIR__ . "/.env",
]);

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    jsonResponse(false, "Invalid JSON payload");
}

$type = $input["type"] ?? "admin_notification";
$email = trim((string) ($input["email"] ?? ""));
$fullName = trim((string) ($input["fullName"] ?? "Guest"));
$guestsCount = (int) ($input["guestsCount"] ?? 0);
$attendanceDays = $input["attendanceDays"] ?? [];

if ($email === "") {
    jsonResponse(false, "Email is required");
}

if (!in_array($type, ["admin_notification", "guest_confirmation"], true)) {
    jsonResponse(false, "Invalid email type");
}

if (!is_array($attendanceDays)) {
    $attendanceDays = [];
}

$attendanceDayLookup = [
    "2026-06-26" => "Day 1 - June 26th, 2026 (Exclusive Dublin Tour)",
    "2026-06-27" => "Day 2 - June 27th, 2026 (Birthday Dinner with Obele)",
    "2026-06-28" => "Day 3 - June 28th, 2026 (Birthday Thanksgiving Day)",
    "day1" => "Day 1 - June 26th, 2026 (Exclusive Dublin Tour)",
    "day2" => "Day 2 - June 27th, 2026 (Birthday Dinner with Obele)",
    "day3" => "Day 3 - June 28th, 2026 (Birthday Thanksgiving Day)",
];

$normalizedAttendanceDays = [];
foreach ($attendanceDays as $dayKey) {
    if (is_string($dayKey) && isset($attendanceDayLookup[$dayKey])) {
        $normalizedAttendanceDays[$dayKey] = $attendanceDayLookup[$dayKey];
    }
}

if (count($normalizedAttendanceDays) === 0) {
    $normalizedAttendanceDays = ["Not specified"];
} else {
    $normalizedAttendanceDays = array_values($normalizedAttendanceDays);
}

$attendanceListHtml = "<ul style='padding-left: 18px; margin: 8px 0 0;'>";
foreach ($normalizedAttendanceDays as $attendanceDayLabel) {
    $safeLabel = htmlspecialchars($attendanceDayLabel, ENT_QUOTES, "UTF-8");
    $attendanceListHtml .= "<li style='margin: 4px 0;'>{$safeLabel}</li>";
}
$attendanceListHtml .= "</ul>";

$smtpConfig = [
    "host" => envValue("SMTP_HOST", $fileEnv, "obeleat50.com"),
    "username" => envValue("SMTP_USERNAME", $fileEnv, "noreply@obeleat50.com"),
    "password" => envValue("SMTP_PASSWORD", $fileEnv, "l7yPl^LQVMCV"),
    "port" => (int) envValue("SMTP_PORT", $fileEnv, "465"),
    "from" => envValue("EMAIL_FROM", $fileEnv, envValue("SMTP_USERNAME", $fileEnv, "noreply@obeleat50.com")),
    "from_name" => envValue("EMAIL_FROM_NAME", $fileEnv, "Obele @ 50"),
    "admin" => envValue("ADMIN_NOTIFICATION_EMAIL", $fileEnv, "admin@obeleat50.com"),
];

$recipientEmail = $type === "admin_notification" ? $smtpConfig["admin"] : $email;
$recipientName = $type === "admin_notification" ? "Admin" : $fullName;

if ($recipientEmail === "") {
    jsonResponse(false, "Recipient email is missing");
}

if ($type === "admin_notification") {
    $subject = "New RSVP Submission: " . $fullName;
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
    $subject = "RSVP Confirmed - Fifty Years of Grace";
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

$sendErrors = [];

$phpMailerAvailable = false;
$phpMailerLoadError = "";

if (file_exists(__DIR__ . "/vendor/autoload.php")) {
    require __DIR__ . "/vendor/autoload.php";
} elseif (file_exists(__DIR__ . "/PHPMailer/src/Exception.php")) {
    require __DIR__ . "/PHPMailer/src/Exception.php";
    require __DIR__ . "/PHPMailer/src/PHPMailer.php";
    require __DIR__ . "/PHPMailer/src/SMTP.php";
}

if (class_exists("PHPMailer\\PHPMailer\\PHPMailer")) {
    $phpMailerAvailable = true;
} else {
    $phpMailerLoadError = "PHPMailer classes are unavailable on the server.";
}

if ($phpMailerAvailable) {
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $smtpConfig["host"];
        $mail->SMTPAuth = true;
        $mail->Username = $smtpConfig["username"];
        $mail->Password = $smtpConfig["password"];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = $smtpConfig["port"];

        $mail->setFrom($smtpConfig["from"], $smtpConfig["from_name"]);
        $mail->addAddress($recipientEmail, $recipientName);

        if ($type === "admin_notification") {
            $mail->addReplyTo($email, $fullName);
        }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $message;

        $mail->send();
        jsonResponse(true, "Email sent successfully via SMTP", ["provider" => "smtp"]);
    } catch (Exception $e) {
        $sendErrors[] = "SMTP send failed: " . $mail->ErrorInfo;
    }
} else {
    $sendErrors[] = $phpMailerLoadError;
}

$resendApiKey = envValue("RESEND_API_KEY", $fileEnv, "");

if ($resendApiKey !== "" && function_exists("curl_init")) {
    $resendFrom = envValue("RESEND_FROM", $fileEnv, $smtpConfig["from_name"] . " <" . $smtpConfig["from"] . ">");
    $payload = json_encode([
        "from" => $resendFrom,
        "to" => [$recipientEmail],
        "subject" => $subject,
        "html" => $message,
        "reply_to" => $type === "admin_notification" ? [$email] : [],
    ]);

    if ($payload === false) {
        $sendErrors[] = "Failed to encode Resend payload.";
    } else {
        $ch = curl_init("https://api.resend.com/emails");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $resendApiKey,
            "Content-Type: application/json",
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);

        $resendResponseBody = curl_exec($ch);
        $curlErrNo = curl_errno($ch);
        $curlErrText = curl_error($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($curlErrNo !== 0) {
            $sendErrors[] = "Resend connection failed: " . $curlErrText;
        } elseif ($statusCode >= 200 && $statusCode < 300) {
            jsonResponse(true, "Email sent successfully via Resend", ["provider" => "resend"]);
        } else {
            $parsed = json_decode((string) $resendResponseBody, true);
            $resendError = $parsed["message"] ?? ("HTTP " . $statusCode);
            $sendErrors[] = "Resend send failed: " . $resendError;
        }
    }
} else {
    if ($resendApiKey === "") {
        $sendErrors[] = "RESEND_API_KEY is not configured.";
    }
    if (!function_exists("curl_init")) {
        $sendErrors[] = "cURL extension is unavailable.";
    }
}

jsonResponse(false, "Unable to send email. " . implode(" | ", $sendErrors));
