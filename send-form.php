<?php
/**
 * send-form.php — jednoduché zpracování kontaktního formuláře bez databáze.
 * Přijme POST z #contact-form, ověří honeypot a povinná pole, pošle e-mail
 * makléři přes PHP mail() (běžně dostupné na sdíleném hostingu, vč. Wedosu).
 *
 * Nastavení pro tohoto klienta — RECIPIENT_EMAIL musí odpovídat
 * "agent.email" v assets/data/site-config.js.
 */

$RECIPIENT_EMAIL = 'radim@mintreality.cz';
$SITE_LABEL       = 'Web Radima Vrány';

// Je to AJAX volání z main.js (fetch), nebo běžné odeslání formuláře bez JS?
$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH'])
    && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

function respond($ok, $message, $isAjax) {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($ok ? 200 : 400);
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }
    // Fallback bez JS — vrať uživatele zpět na formulář s příznakem ve URL.
    $target = $ok ? 'index.html?sent=1#napiste' : 'index.html?sent=0#napiste';
    header('Location: ' . $target);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Neplatná metoda.', $isAjax);
}

// Honeypot — bot skryté pole vyplní, člověk ne. Tváříme se jako úspěch, nic neposíláme.
if (!empty($_POST['company'])) {
    respond(true, 'OK', $isAjax);
}

$name    = trim($_POST['name'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');
$sluzba  = trim($_POST['sluzba'] ?? '');
$gdpr    = !empty($_POST['gdpr']);

if ($name === '') {
    respond(false, 'Vyplňte prosím jméno.', $isAjax);
}
if ($phone === '') {
    respond(false, 'Vyplňte prosím telefon.', $isAjax);
}
if ($email === '') {
    respond(false, 'Vyplňte prosím e-mail.', $isAjax);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Zadejte platný e-mail.', $isAjax);
}
if (!$gdpr) {
    respond(false, 'Je nutný souhlas se zpracováním osobních údajů.', $isAjax);
}

// Ochrana proti header injection — odstraní nové řádky ze vstupů použitých v hlavičkách.
function cleanHeaderValue($value) {
    return str_replace(["\r", "\n"], '', $value);
}

$safeName  = cleanHeaderValue($name);
$safeEmail = ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL))
    ? cleanHeaderValue($email)
    : '';

$subject = '=?UTF-8?B?' . base64_encode('Nová poptávka z webu' . ($sluzba !== '' ? ' — ' . $sluzba : '')) . '?=';

$bodyLines = [
    'Nová zpráva z kontaktního formuláře (' . $SITE_LABEL . ')',
    '',
    'Služba: ' . ($sluzba !== '' ? $sluzba : '—'),
    'Jméno: ' . $name,
    'Telefon: ' . ($phone !== '' ? $phone : '—'),
    'E-mail: ' . ($email !== '' ? $email : '—'),
    '',
    'Zpráva:',
    ($message !== '' ? $message : '—'),
];
$body = implode("\n", $bodyLines);

$serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';
$headers = [];
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . $SITE_LABEL . ' <no-reply@' . $serverName . '>';
if ($safeEmail !== '') {
    $headers[] = 'Reply-To: ' . $safeName . ' <' . $safeEmail . '>';
}

$sent = @mail($RECIPIENT_EMAIL, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    respond(true, 'Zpráva byla odeslána, ozveme se co nejdříve.', $isAjax);
} else {
    respond(false, 'Odeslání se nezdařilo, zkuste to prosím znovu nebo nám rovnou zavolejte.', $isAjax);
}
