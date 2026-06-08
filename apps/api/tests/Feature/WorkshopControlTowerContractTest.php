<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\User;
use App\Models\WoProcessInstance;
use App\Models\WoProcessStepLog;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkshopControlTowerContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_control_tower_work_orders_accept_web_bay_alias_and_return_plate_aliases(): void
    {
        $this->seed();

        $user = User::where('email', 'supervisor@tapg.local')->firstOrFail();
        $user->givePermissionTo('view work-orders');

        [$workOrder] = $this->makeApprovalQueueFixture($user, 'in_progress');

        $this->actingAsApi($user)
            ->getJson('/api/v1/workshop-control-tower/work-orders?bay=approval&status=in_progress')
            ->assertOk()
            ->assertJsonPath('data.0.wo_id', $workOrder->id)
            ->assertJsonPath('data.0.step_code', 'APPROVAL')
            ->assertJsonPath('data.0.license_plate', 'B 1234 CD')
            ->assertJsonPath('data.0.police_no', 'B 1234 CD');
    }

    public function test_control_tower_bottlenecks_return_summary_aliases_for_web_dashboard(): void
    {
        $this->seed();

        $user = User::where('email', 'supervisor@tapg.local')->firstOrFail();
        $user->givePermissionTo('view work-orders');

        $this->makeApprovalQueueFixture($user, 'on_hold');

        $this->actingAsApi($user)
            ->getJson('/api/v1/workshop-control-tower/bottlenecks?bay=approval&status=on_hold')
            ->assertOk()
            ->assertJsonPath('summary.step', 'APPROVAL')
            ->assertJsonPath('summary.late', 1)
            ->assertJsonPath('summary.hold', 1)
            ->assertJsonPath('step', 'APPROVAL')
            ->assertJsonPath('late', 1)
            ->assertJsonPath('hold', 1)
            ->assertJsonStructure([
                'summary' => ['step', 'late', 'hold'],
                'top_by_actual',
                'top_by_downtime',
                'top_bay_by_queue',
            ]);
    }

    private function makeApprovalQueueFixture(User $supervisor, string $woStatus): array
    {
        $category = AssetCategory::query()->create(['name' => 'Dump Truck']);
        $asset = Asset::query()->create([
            'code' => 'DT-CTRL-001',
            'name' => 'Dump Truck Control Tower',
            'category_id' => $category->id,
            'status' => 'active',
            'veh_plate_no' => 'B 1234 CD',
        ]);

        $workOrder = WorkOrder::query()->create([
            'code' => 'WO-CTRL-001',
            'asset_id' => $asset->id,
            'type' => 'preventive',
            'priority' => 'high',
            'title' => 'Control tower queue',
            'status' => $woStatus,
            'supervisor_id' => $supervisor->id,
            'created_by' => $supervisor->id,
        ]);

        $instance = WoProcessInstance::query()->create([
            'wo_id' => $workOrder->id,
            'template_id' => null,
            'current_step_order' => 20,
            'state' => $woStatus === 'on_hold' ? 'hold' : 'running',
        ]);

        WoProcessStepLog::query()->create([
            'wo_id' => $workOrder->id,
            'process_instance_id' => $instance->id,
            'template_step_id' => null,
            'step_order' => 20,
            'step_code' => 'APPROVAL',
            'step_name' => 'Approval Kedatangan',
            'status' => $woStatus === 'on_hold' ? 'hold' : 'in_progress',
            'process_in_at' => now()->subMinutes(30),
            'est_minutes' => 10,
            'actual_minutes' => 15,
            'downtime_minutes' => 5,
            'bay_in' => 'qc_bay',
            'bay_in_at' => now()->subMinutes(20),
            'queue_minutes' => 20,
        ]);

        return [$workOrder, $asset];
    }

    private function actingAsApi(User $user): self
    {
        $token = $user->createToken('test-token')->plainTextToken;

        return $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->actingAs($user, 'sanctum');
    }
}
