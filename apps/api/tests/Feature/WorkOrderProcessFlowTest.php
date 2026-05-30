<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderProcessFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_work_order_process_happy_path(): void
    {
        $this->seed();

        $user = User::where('email', 'mechanic@tapg.local')->firstOrFail();
        $user->givePermissionTo('execute work-orders');

        $category = AssetCategory::query()->create(['name' => 'Excavator']);
        $asset = Asset::query()->create([
            'code' => 'EXC-T-001',
            'name' => 'Excavator Test 001',
            'category_id' => $category->id,
            'status' => 'active',
        ]);

        $supervisor = User::where('email', 'supervisor@tapg.local')->firstOrFail();

        $workOrder = WorkOrder::query()->create([
            'code' => 'WO-TEST-001',
            'asset_id' => $asset->id,
            'type' => 'preventive',
            'priority' => 'medium',
            'title' => 'Service test',
            'status' => 'approved',
            'supervisor_id' => $supervisor->id,
            'created_by' => $supervisor->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/start")
            ->assertOk();

        $process = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/work-orders/{$workOrder->id}/process")
            ->assertOk()
            ->json();

        $this->assertNotEmpty($process['instances']);
        $firstStep = $process['instances'][0]['step_logs'][0]['step_order'];

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$firstStep}/in", ['notes' => 'start'])
            ->assertOk();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$firstStep}/out", ['downtime_minutes' => 5])
            ->assertOk();
    }
}
