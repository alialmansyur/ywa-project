<?php

namespace App\Http\Controllers\Api\V1\WorkOrder;

use App\Http\Controllers\Controller;
use App\Services\WorkOrder\WorkshopControlTowerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags Work Orders - Workshop Control Tower
 */
class WorkshopControlTowerController extends Controller
{
    public function __construct(private readonly WorkshopControlTowerService $service)
    {
    }

    public function overview(): JsonResponse
    {
        return response()->json($this->service->overview());
    }

    public function queues(Request $request): JsonResponse
    {
        return response()->json($this->service->queues($request));
    }

    public function stepQueues(Request $request): JsonResponse
    {
        return response()->json($this->service->stepQueues($request));
    }

    public function liveFeed(Request $request): JsonResponse
    {
        return response()->json($this->service->liveFeed($request));
    }

    public function bottlenecks(Request $request): JsonResponse
    {
        return response()->json($this->service->bottlenecks($request));
    }

    public function workOrders(Request $request): JsonResponse
    {
        return response()->json($this->service->workOrders($request));
    }

    public function approvalQueue(Request $request): JsonResponse
    {
        return response()->json($this->service->approvalQueue($request));
    }
}
