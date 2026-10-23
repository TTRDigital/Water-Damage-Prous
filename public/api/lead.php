<?php
/*
 * Lead form handler for SiteGround (the static site has no Node server).
 * The forms post here: "quick" (name, phone, address, what happened), "message"
 * (name, phone, email, address, message) and "comment" (the blog posts' "Leave a Reply" form:
 * comment, name, email, website). Validates like the form does, filters spam and posts the lead
 * as flat JSON to the GoHighLevel inbound webhook.
 *
 * The webhook URL lives in lead-config.php (next to public_html or in this folder; blocked from
 * the web by .htaccess), returning ['webhook_url' => 'https://services.leadconnectorhq.com/hooks/...'].
 * The deploy workflow writes it from the GHL_WEBHOOK_URL secret. Until then, requests are accepted
 * (the visitor sees the thank-you message) but NOT forwarded anywhere, and the error log says so.
 *
 * Without JavaScript the browser posts the form fields directly; the visitor is then sent back
 * to the page (?sent=1 or ?error=1, at the form: #help, or #respond for a comment).
 */

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

$isJson = stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === 0;

function back(string $flag): void {
    $ref = $_SERVER['HTTP_REFERER'] ?? '/';
    $host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
    $path = strtolower((string) parse_url($ref, PHP_URL_HOST)) === $host ? (string) parse_url($ref, PHP_URL_PATH) : '/';
    $anchor = isset($_POST['comment']) ? '#respond' : '#help';
    header('Location: ' . ($path ?: '/') . '?' . $flag . '=1' . $anchor, true, 303);
    exit;
}

function reply(int $status, array $body): void {
    global $isJson;
    if (!$isJson && $_SERVER['REQUEST_METHOD'] === 'POST') back($body['ok'] ?? false ? 'sent' : 'error');
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    reply(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

// Same-site posts only.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
if ($origin !== '' && $origin !== 'null' && strtolower((string) parse_url($origin, PHP_URL_HOST)) !== $host) {
    reply(403, ['ok' => false, 'error' => 'Forbidden.']);
}

/* Best-effort per-IP rate limit: 10 requests per 10 minutes. */
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = sys_get_temp_dir() . '/wdp-lead-' . md5($ip);
$now = time();
$recent = array_filter(
    json_decode((string) @file_get_contents($bucket), true) ?: [],
    fn($t) => is_int($t) && $now - $t < 600
);
$recent[] = $now;
@file_put_contents($bucket, json_encode(array_values($recent)), LOCK_EX);
if (count($recent) > 10) {
    reply(429, ['ok' => false, 'error' => 'Too many requests. Please call us instead.']);
}

if ($isJson) {
    $in = json_decode((string) file_get_contents('php://input', false, null, 0, 64 * 1024), true);
    if (!is_array($in)) reply(400, ['ok' => false, 'error' => 'Invalid request.']);
} else {
    $in = $_POST;
    $in['consent'] = ($in['consent'] ?? '') === 'yes';
    $in['form'] = isset($in['comment']) ? 'comment' : (isset($in['message']) || isset($in['email']) ? 'message' : 'quick');
    if ($in['form'] === 'comment') {
        // The "Leave a Reply" form keeps WordPress's field names.
        $in['name'] = $in['author'] ?? '';
        $in['message'] = $in['comment'] ?? '';
        $in['website'] = $in['url'] ?? '';
    }
}

function text(array $in, string $key, int $max): string {
    $v = $in[$key] ?? '';
    if (!is_string($v)) return '';
    return mb_substr(trim($v), 0, $max);
}

// Keep in sync with components/forms/LeadForm.tsx and components/layout/LegacyScripts.tsx.
$form = text($in, 'form', 20);
if (!in_array($form, ['message', 'comment'], true)) $form = 'quick';
$lead = [
    'name' => text($in, 'name', 120),
    'phone' => text($in, 'phone', 40),
    'email' => text($in, 'email', 200),
    'address' => text($in, 'address', 300),
    'details' => $form === 'quick' ? text($in, 'issue', 3000) : text($in, 'message', 3000),
    'website' => text($in, 'website', 200),
];

$errors = [];
if ($form === 'comment') {
    // As WordPress checked a comment: comment, name and a valid email required.
    if ($lead['details'] === '') $errors['comment'] = 'Please type your comment text.';
    if ($lead['name'] === '') $errors['author'] = 'Please fill the required fields.';
    if (!filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please enter a valid email address.';
} else {
    if (mb_strlen($lead['name']) < 2) $errors['name'] = 'Please enter your full name.';
    if (!preg_match('/^[0-9()#&+*\-=. ]+$/', $lead['phone']) || strlen(preg_replace('/\D/', '', $lead['phone'])) < 10) $errors['phone'] = 'Please enter a phone number with area code.';
    if ($lead['email'] !== '' && !filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please enter a valid email address.';
    if (($in['consent'] ?? false) !== true) $errors['consent'] = 'Please agree so we can contact you.';
}
if ($errors) {
    reply(422, ['ok' => false, 'error' => 'Please check the form.', 'fields' => $errors]);
}

// Spam: drop only when both signals agree (hidden field filled AND sent faster than a person can
// type). One signal alone can be autofill or a fast typist: delivered with a "suspected-spam" tag.
$trapFilled = text($in, 'website_url', 200) !== '';
$elapsed = is_int($in['elapsed_ms'] ?? null) ? $in['elapsed_ms'] : null;
$tooFast = $elapsed !== null && $elapsed < 2500; // MIN_FILL_MS in lib/lead-options.ts
if ($trapFilled && $tooFast) {
    reply(200, ['ok' => true]);
}
$spamCheck = $trapFilled ? 'suspect: hidden field filled' : ($tooFast ? "suspect: sent in {$elapsed} ms" : 'ok');

// Settings
$config = [];
foreach ([dirname(__DIR__, 2) . '/lead-config.php', __DIR__ . '/lead-config.php'] as $file) {
    if (is_file($file)) {
        $config = (array) include $file;
        break;
    }
}
$webhook = trim((string) ($config['webhook_url'] ?? ''), " \t\n\r\0\x0B\"'");
if ($webhook === '') {
    error_log('[lead] No GoHighLevel webhook configured (lead-config.php): request accepted but NOT sent.');
    reply(200, ['ok' => true, 'delivered' => false]);
}
// https only; plain http is allowed for a local test webhook (localhost).
if (!preg_match('#^https://#', $webhook) && !preg_match('#^http://(localhost|127\.0\.0\.1)(:\d+)?/#', $webhook)) {
    error_log('[lead] GoHighLevel webhook URL is not https: request accepted but NOT sent. Check lead-config.php.');
    reply(200, ['ok' => true, 'delivered' => false]);
}

/** E.164 for US numbers. */
$digits = preg_replace('/\D/', '', $lead['phone']);
if (strlen($digits) === 10) $phone = '+1' . $digits;
elseif (strlen($digits) === 11 && $digits[0] === '1') $phone = '+' . $digits;
else $phone = (str_starts_with($lead['phone'], '+') ? '+' : '') . $digits;

$parts = preg_split('/\s+/', $lead['name']);
$kinds = [
    'quick' => ['Website emergency help form', 'emergency-help-form', 'Request Immediate Help'],
    'message' => ['Website contact form', 'contact-form', 'Send Us a Message'],
    'comment' => ['Website blog comment', 'blog-comment', 'Leave a Reply'],
];
$tags = ['website-lead', $kinds[$form][1]];
if ($spamCheck !== 'ok') $tags[] = 'suspected-spam';
$formName = text($in, 'form_name', 100) ?: $kinds[$form][2];
$pageUrl = text($in, 'page_url', 1000) ?: (string) ($_SERVER['HTTP_REFERER'] ?? '');

/*
 * One payload for every form, so one GoHighLevel workflow handles them all: name, phone and email
 * first, then every field (always the same keys, empty when the form has no such field), then
 * "response": all of it as one block of text, one "Label: value" line per field.
 */
$fields = [
    // key => label in "response"
    'name' => ['Name', $lead['name']],
    'phone' => ['Phone', $phone],
    'email' => ['Email', $lead['email']],
    'first_name' => ['First name', $parts[0]],
    'last_name' => ['Last name', implode(' ', array_slice($parts, 1))],
    'phone_raw' => ['Phone (as typed)', $lead['phone']],
    'address' => ['Property address', $lead['address']],
    'message' => ['Message', $lead['details']],
    'website' => ['Website', $lead['website']],
    'form_name' => ['Form', $formName],
    'form' => ['Form type', $form],
    'source' => ['Source', $kinds[$form][0]],
    'page_url' => ['Page', $pageUrl],
    'landing_page' => ['Landing page', text($in, 'landing_page', 1000)],
    'referrer' => ['Referrer', text($in, 'referrer', 1000)],
    'utm_source' => ['UTM source', text($in, 'utm_source', 1000)],
    'utm_medium' => ['UTM medium', text($in, 'utm_medium', 1000)],
    'utm_campaign' => ['UTM campaign', text($in, 'utm_campaign', 1000)],
    'utm_term' => ['UTM term', text($in, 'utm_term', 1000)],
    'utm_content' => ['UTM content', text($in, 'utm_content', 1000)],
    'gclid' => ['Google click ID (gclid)', text($in, 'gclid', 1000)],
    'fbclid' => ['Facebook click ID (fbclid)', text($in, 'fbclid', 1000)],
    'consent' => ['Agreed to be contacted', $form === 'comment' ? 'No' : 'Yes'],
    'spam_check' => ['Spam check', $spamCheck],
    'tags' => ['Tags', implode(', ', $tags)],
    'submitted_at' => ['Submitted (UTC)', gmdate('Y-m-d H:i:s')],
];
$payload = [];
$lines = [];
foreach ($fields as $key => [$label, $value]) {
    $payload[$key] = $value;
    $lines[] = $label . ': ' . ($value === '' ? 'Not provided' : $value);
}
$payload['response'] = implode("\n", $lines);

// One retry for rate limits, server errors and network failures.
$body = json_encode($payload);
for ($attempt = 0; $attempt < 2; $attempt++) {
    $ch = curl_init($webhook);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    $res = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($status >= 200 && $status < 300) {
        reply(200, ['ok' => true, 'delivered' => true]);
    }
    error_log("[lead] GoHighLevel webhook answered {$status}: " . substr((string) $res, 0, 300));
    if ($status !== 0 && $status !== 429 && $status < 500) break;
    usleep(600000);
}

// Nothing saved the request: tell the visitor so they can call instead.
reply(502, ['ok' => false, 'error' => 'We could not send your request. Please call us instead.']);
