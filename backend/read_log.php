<?php
$file = __DIR__ . '/storage/logs/laravel.log';
if (file_exists($file)) {
    $lines = file($file);
    $last_lines = array_slice($lines, -50);
    echo implode("", $last_lines);
} else {
    echo "Log file not found.";
}
