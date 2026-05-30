<?php
$baseUrl = 'http://api-nginx/api/v1';
$token   = '1|54HOJZAswEBNQ6oPyTSo8Vt9OIQxrDV7suf4TGpN8dac81a4';

function apiRequest(string $method, string $url, array $data = [], string $token = ''): array
{
    $opts = [
        'http' => [
            'method'        => $method,
            'header'        => "Content-Type: application/json\r\nAccept: application/json\r\nAuthorization: Bearer {$token}",
            'content'       => $data ? json_encode($data) : null,
            'ignore_errors' => true,
        ]
    ];
    $context = stream_context_create($opts);
    $result  = file_get_contents($url, false, $context);
    $status  = $http_response_header[0] ?? '';

    return [$status, json_decode($result, true)];
}

// 1. GET /auth/me
[$status, $body] = apiRequest('GET', "$baseUrl/auth/me", [], $token);
echo "=== GET /auth/me ===\n";
echo "$status\n";
echo json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// 2. GET /assets
[$status, $body] = apiRequest('GET', "$baseUrl/assets", [], $token);
echo "=== GET /assets ===\n";
echo "$status\n";
echo "Total: " . ($body['total'] ?? 'N/A') . "\n";
echo "Items count: " . count($body['data'] ?? []) . "\n\n";

// 3. GET /schedules/upcoming
[$status, $body] = apiRequest('GET', "$baseUrl/schedules/upcoming", [], $token);
echo "=== GET /schedules/upcoming ===\n";
echo "$status\n";
echo json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// 4. GET /spare-parts
[$status, $body] = apiRequest('GET', "$baseUrl/spare-parts", [], $token);
echo "=== GET /spare-parts ===\n";
echo "$status\n";
echo "Total parts: " . ($body['total'] ?? 'N/A') . "\n\n";

// 5. GET /work-orders
[$status, $body] = apiRequest('GET', "$baseUrl/work-orders", [], $token);
echo "=== GET /work-orders ===\n";
echo "$status\n";
echo "Total WOs: " . ($body['total'] ?? 'N/A') . "\n";
echo "Items: " . count($body['data'] ?? []) . "\n";
