<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireBearerToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header("Authorization", "");

        if (! is_string($header) || ! preg_match('/^Bearer\s+\S+$/i', trim($header))) {
            return response()->json([
                "code" => "UNAUTHORIZED",
                "message" => "Missing or invalid bearer token.",
            ], 401);
        }

        return $next($request);
    }
}
