<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheJsonGetResponses
{
    private const TTL_SECONDS = 60;

    public function handle(Request $request, Closure $next): Response
    {
        if (!in_array($request->method(), ['GET', 'HEAD'], true)) {
            return $next($request);
        }

        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        $cacheKey = sprintf(
            'api-json:%s:%s',
            $user->getAuthIdentifier(),
            sha1($request->fullUrl() . '|' . $request->header('accept', 'application/json'))
        );

        $cached = Cache::get($cacheKey);
        if (is_array($cached) && isset($cached['status'], $cached['data'])) {
            return new JsonResponse($cached['data'], (int) $cached['status']);
        }

        $response = $next($request);

        if ($response instanceof JsonResponse && $response->isSuccessful()) {
            Cache::put($cacheKey, [
                'status' => $response->getStatusCode(),
                'data' => $response->getData(true),
            ], now()->addSeconds(self::TTL_SECONDS));
        }

        return $response;
    }
}