<?php

namespace App\Http\Middleware;

use App\Services\Approval\ApprovalWorkflowService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveApprovalTemplate
{
    public function __construct(private readonly ApprovalWorkflowService $approvalWorkflowService)
    {
    }

    public function handle(Request $request, Closure $next, string $routeKey): Response
    {
        $template = $this->approvalWorkflowService->resolveActiveTemplate($routeKey);
        $request->attributes->set('approval.route_key', $routeKey);
        $request->attributes->set('approval.template', $template);
        $request->attributes->set('approval.required', (bool) $template);

        return $next($request);
    }
}
