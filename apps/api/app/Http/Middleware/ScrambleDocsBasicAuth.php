<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ScrambleDocsBasicAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $username = (string) env('SCRAMBLE_DOCS_USER', '');
        $password = (string) env('SCRAMBLE_DOCS_PASS', '');

        // Fail closed: if creds are not configured, deny access.
        if ($username === '' || $password === '') {
            return response('Scramble docs credentials are not configured.', 403);
        }

        $providedUser = (string) $request->getUser();
        $providedPass = (string) $request->getPassword();

        if (! hash_equals($username, $providedUser) || ! hash_equals($password, $providedPass)) {
            return response('Unauthorized', 401, [
                'WWW-Authenticate' => 'Basic realm="Scramble API Docs"',
            ]);
        }

        return $next($request);
    }
}
