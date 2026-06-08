<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__."/../routes/web.php",
        api: __DIR__."/../routes/api.php",
        commands: __DIR__."/../routes/console.php",
        health: "/up",
        apiPrefix: "api",
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->alias([
            "role" => RoleMiddleware::class,
            "permission" => PermissionMiddleware::class,
            "role_or_permission" => RoleOrPermissionMiddleware::class,
            "require.bearer" => \App\Http\Middleware\RequireBearerToken::class,
            "approval.template" => \App\Http\Middleware\ResolveApprovalTemplate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for API routes
        $exceptions->shouldRenderJsonWhen(function ($request) {
            return $request->is("api/*");
        });

        $exceptions->render(function (ThrottleRequestsException|TooManyRequestsHttpException $exception, $request) {
            if (! $request->is("api/*")) {
                return null;
            }

            $retryAfter = max(1, (int) ($exception->getHeaders()["Retry-After"] ?? 60));

            return response()->json([
                "message" => "Too Many Attempts. Silakan coba lagi dalam {$retryAfter} detik.",
                "code" => "RATE_LIMITED",
                "retry_after_seconds" => $retryAfter,
            ], 429);
        });

        $exceptions->render(function (AuthenticationException $exception, $request) {
            if (! $request->is("api/*")) {
                return null;
            }

            return response()->json([
                "code" => "UNAUTHORIZED",
                "message" => "Unauthorized.",
            ], 401);
        });

        $exceptions->render(function (AuthorizationException $exception, $request) {
            if (! $request->is("api/*")) {
                return null;
            }

            return response()->json([
                "code" => "FORBIDDEN",
                "message" => "Forbidden.",
            ], 403);
        });

        $exceptions->render(function (ValidationException $exception, $request) {
            if (! $request->is("api/*")) {
                return null;
            }

            return response()->json([
                "code" => "VALIDATION_ERROR",
                "message" => "Validation failed.",
                "errors" => $exception->errors(),
            ], 422);
        });

        $exceptions->render(function (ModelNotFoundException $exception, $request) {
            if (! $request->is("api/*")) {
                return null;
            }

            return response()->json([
                "code" => "NOT_FOUND",
                "message" => "Resource not found.",
            ], 404);
        });

        $exceptions->render(function (HttpResponseException $exception, $request) {
            if (! $request->is("api/*")) {
                return null;
            }

            return $exception->getResponse();
        });

        $exceptions->render(function (\Throwable $exception, $request) {
            if (! $request->is("api/*")) {
                return null;
            }

            if ($exception instanceof HttpExceptionInterface) {
                $status = $exception->getStatusCode();
                $message = $status >= 500 ? "Server error." : ($exception->getMessage() ?: "Request failed.");

                return response()->json([
                    "code" => match ($status) {
                        400 => "BAD_REQUEST",
                        401 => "UNAUTHORIZED",
                        403 => "FORBIDDEN",
                        404 => "NOT_FOUND",
                        405 => "METHOD_NOT_ALLOWED",
                        409 => "CONFLICT",
                        415 => "UNSUPPORTED_MEDIA_TYPE",
                        422 => "UNPROCESSABLE_ENTITY",
                        429 => "RATE_LIMITED",
                        default => "HTTP_ERROR",
                    },
                    "message" => $message,
                ], $status);
            }

            report($exception);

            return response()->json([
                "code" => "INTERNAL_SERVER_ERROR",
                "message" => "Internal server error.",
            ], 500);
        });
    })->create();
