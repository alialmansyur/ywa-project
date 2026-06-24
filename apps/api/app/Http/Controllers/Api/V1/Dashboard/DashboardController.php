<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags Dashboard
 */
class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $service)
    {
    }

    public function overview(): JsonResponse
    {
        return response()->json($this->service->overview());
    }

    public function workOrderStatus(Request $request): JsonResponse
    {
        return response()->json($this->service->workOrderStatus($request));
    }

    public function workshopOperationalSummary(): JsonResponse
    {
        return response()->json($this->service->workshopOperationalSummary());
    }

    public function workshopKpiDetails(): JsonResponse
    {
        return response()->json($this->service->workshopKpiDetails());
    }

    public function p2hComplianceTrend(Request $request): JsonResponse
    {
        return response()->json($this->service->p2hComplianceTrend($request));
    }

    public function upcomingSchedules(Request $request): JsonResponse
    {
        return response()->json($this->service->upcomingSchedules($request));
    }

    public function assetStatus(): JsonResponse
    {
        return response()->json($this->service->assetStatus());
    }

    public function recentActivities(Request $request): JsonResponse
    {
        return response()->json($this->service->recentActivities($request));
    }

    public function workOrderPriority(Request $request): JsonResponse
    {
        return response()->json($this->service->workOrderPriority($request));
    }

    public function downtimeTrend(Request $request): JsonResponse
    {
        return response()->json($this->service->downtimeTrend($request));
    }

    public function analystSummary(Request $request): JsonResponse
    {
        return response()->json($this->service->analystSummary($request));
    }
}
