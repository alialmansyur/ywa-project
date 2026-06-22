<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\SparePart;
use App\Models\User;
use App\Models\WoPartsUsage;
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

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/start")
            ->assertOk();

        $process = $this->actingAsApi($user)
            ->getJson("/api/v1/work-orders/{$workOrder->id}/process")
            ->assertOk()
            ->json();

        $this->assertNotEmpty($process['instances']);
        $firstReadyStep = collect($process['instances'][0]['step_logs'])->firstWhere('status', 'ready');
        $this->assertNotNull($firstReadyStep);
        $firstStep = $firstReadyStep['step_order'];

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$firstStep}/in", ['notes' => 'start'])
            ->assertOk();

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$firstStep}/out", [
                'downtime_minutes' => 5,
                'notes' => 'Langkah pertama selesai.',
            ])
            ->assertOk();
    }

    public function test_workshop_bay_repair_step_reserves_parts_and_normalizes_main_location(): void
    {
        $this->seed();

        $user = User::where('email', 'mechanic@tapg.local')->firstOrFail();
        $user->givePermissionTo('execute work-orders');

        $category = AssetCategory::query()->create(['name' => 'Excavator']);
        $asset = Asset::query()->create([
            'code' => 'EXC-T-002',
            'name' => 'Excavator Test 002',
            'category_id' => $category->id,
            'status' => 'active',
        ]);

        $supervisor = User::where('email', 'supervisor@tapg.local')->firstOrFail();

        $workOrder = WorkOrder::query()->create([
            'code' => 'WO-TEST-REPAIR-001',
            'asset_id' => $asset->id,
            'type' => 'preventive',
            'priority' => 'medium',
            'title' => 'Service bay spare part test',
            'status' => 'approved',
            'supervisor_id' => $supervisor->id,
            'created_by' => $supervisor->id,
        ]);

        $sparePart = SparePart::query()->create([
            'code' => 'SP-001',
            'name' => 'Filter Oli',
            'unit' => 'pcs',
            'min_stock' => 1,
            'unit_price' => 125000,
            'is_active' => true,
        ]);

        $inventory = Inventory::query()->create([
            'part_id' => $sparePart->id,
            'location' => 'gudang-utama',
            'qty_available' => 10,
        ]);

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/start")
            ->assertOk();

        $process = $this->actingAsApi($user)
            ->getJson("/api/v1/work-orders/{$workOrder->id}/process")
            ->assertOk()
            ->json();

        $stepLogs = collect($process['instances'][0]['step_logs'] ?? []);

        foreach (['WASHING_BAY', 'INSPECTION_PKB', 'CHECKING', 'WAITING_BAY'] as $stepCode) {
            $stepOrder = (int) $stepLogs->firstWhere('step_code', $stepCode)['step_order'];

            $this->actingAsApi($user)
                ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$stepOrder}/in", ['notes' => "Mulai {$stepCode}"])
                ->assertOk();

            $this->actingAsApi($user)
                ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$stepOrder}/out", [
                    'notes' => "Selesai {$stepCode}",
                ])
                ->assertOk();
        }

        $createWoStepOrder = (int) $stepLogs->firstWhere('step_code', 'CREATE_WO')['step_order'];

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$createWoStepOrder}/in", ['notes' => 'Mulai CREATE_WO'])
            ->assertOk();

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$createWoStepOrder}/out", [
                'notes' => 'WO dan jobcard selesai dibuat.',
                'sap_reference_no' => 'SAP-WO-001',
            ])
            ->assertOk();

        $repairStepOrder = (int) $stepLogs->firstWhere('step_code', 'REPAIR')['step_order'];

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$repairStepOrder}/in", ['notes' => 'Mulai REPAIR'])
            ->assertOk();

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$repairStepOrder}/out", [
                'notes' => 'Selesai REPAIR dengan ganti filter.',
                'part_required' => true,
                'part_items' => [
                    [
                        'part_id' => $sparePart->id,
                        'qty' => 2,
                        'location' => 'main',
                    ],
                ],
            ])
            ->assertOk();

        $this->assertDatabaseHas('wo_parts_usage', [
            'wo_id' => $workOrder->id,
            'part_id' => $sparePart->id,
            'qty_requested' => 2,
            'qty_used' => 2,
        ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'part_id' => $sparePart->id,
            'type' => 'out',
            'reference_type' => 'work_order',
            'reference_id' => $workOrder->id,
            'processed_by' => $user->id,
        ]);

        $this->assertSame(8.0, (float) $inventory->fresh()->qty_available);
        $this->assertSame(1, WoPartsUsage::query()->where('wo_id', $workOrder->id)->count());
        $this->assertSame(1, InventoryTransaction::query()->where('reference_id', $workOrder->id)->count());
    }

    public function test_workshop_bay_template_places_create_wo_before_waiting_bay_and_timeline_marks_step_in(): void
    {
        $this->seed();

        $user = User::where('email', 'mechanic@tapg.local')->firstOrFail();
        $user->givePermissionTo('execute work-orders');

        $category = AssetCategory::query()->create(['name' => 'Excavator']);
        $asset = Asset::query()->create([
            'code' => 'EXC-T-003',
            'name' => 'Excavator Test 003',
            'category_id' => $category->id,
            'status' => 'active',
        ]);

        $supervisor = User::where('email', 'supervisor@tapg.local')->firstOrFail();

        $workOrder = WorkOrder::query()->create([
            'code' => 'WO-TEST-ORDER-001',
            'asset_id' => $asset->id,
            'type' => 'preventive',
            'priority' => 'medium',
            'title' => 'Service order swap test',
            'status' => 'approved',
            'supervisor_id' => $supervisor->id,
            'created_by' => $supervisor->id,
        ]);

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/start")
            ->assertOk();

        $process = $this->actingAsApi($user)
            ->getJson("/api/v1/work-orders/{$workOrder->id}/process")
            ->assertOk()
            ->json();

        $stepLogs = collect($process['instances'][0]['step_logs'] ?? []);
        $createWoStepOrder = (int) $stepLogs->firstWhere('step_code', 'CREATE_WO')['step_order'];
        $waitingBayStepOrder = (int) $stepLogs->firstWhere('step_code', 'WAITING_BAY')['step_order'];

        $this->assertSame(60, $createWoStepOrder);
        $this->assertSame(70, $waitingBayStepOrder);

        $washingStepOrder = (int) $stepLogs->firstWhere('step_code', 'WASHING_BAY')['step_order'];

        $this->actingAsApi($user)
            ->postJson("/api/v1/work-orders/{$workOrder->id}/process/steps/{$washingStepOrder}/in", ['notes' => 'Mulai washing'])
            ->assertOk();

        $timeline = $this->actingAsApi($user)
            ->getJson("/api/v1/work-orders/{$workOrder->id}/timeline")
            ->assertOk()
            ->json();

        $stepInEvent = collect($timeline)->first(fn ($row) => ($row['event_key'] ?? $row['title'] ?? null) === 'STEP_IN');

        $this->assertNotNull($stepInEvent);
        $this->assertSame('Step Mulai', $stepInEvent['event_label']);
        $this->assertSame('in_progress', $stepInEvent['state']);
        $this->assertSame('WASHING_BAY', $stepInEvent['step_code']);
        $this->assertSame($washingStepOrder, (int) $stepInEvent['source_step_order']);
        $this->assertNotEmpty($stepInEvent['started_at']);
    }

    public function test_work_order_detail_exposes_field_code_from_asset_code(): void
    {
        $this->seed();

        $user = User::where('email', 'mechanic@tapg.local')->firstOrFail();
        $category = AssetCategory::query()->create(['name' => 'Excavator']);
        $asset = Asset::query()->create([
            'code' => 'FIELD-A1',
            'name' => 'Excavator Test 004',
            'category_id' => $category->id,
            'status' => 'active',
        ]);

        $supervisor = User::where('email', 'supervisor@tapg.local')->firstOrFail();

        $workOrder = WorkOrder::query()->create([
            'code' => 'WO-TEST-SHOW-001',
            'asset_id' => $asset->id,
            'type' => 'preventive',
            'priority' => 'medium',
            'title' => 'Service show test',
            'status' => 'approved',
            'supervisor_id' => $supervisor->id,
            'created_by' => $supervisor->id,
        ]);

        $this->actingAsApi($user)
            ->getJson("/api/v1/work-orders/{$workOrder->id}")
            ->assertOk()
            ->assertJsonPath('field.code', 'FIELD-A1');
    }

    public function test_work_order_cancel_status_persists_cancel_reason_in_same_table(): void
    {
        $this->seed();

        $user = User::where('email', 'supervisor@tapg.local')->firstOrFail();
        $user->givePermissionTo('edit work-orders');

        $category = AssetCategory::query()->create(['name' => 'Excavator']);
        $asset = Asset::query()->create([
            'code' => 'EXC-T-005',
            'name' => 'Excavator Test 005',
            'category_id' => $category->id,
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::query()->create([
            'code' => 'WO-TEST-CANCEL-001',
            'asset_id' => $asset->id,
            'type' => 'preventive',
            'priority' => 'medium',
            'title' => 'Service cancel test',
            'status' => 'approved',
            'supervisor_id' => $user->id,
            'created_by' => $user->id,
        ]);

        $this->actingAsApi($user)
            ->patchJson("/api/v1/work-orders/{$workOrder->id}/status", [
                'status' => 'cancelled',
                'notes' => 'Unit tidak jadi masuk workshop.',
                'cancel_reason' => 'Unit tidak jadi masuk workshop.',
            ])
            ->assertOk()
            ->assertJsonPath('work_order.status', 'cancelled')
            ->assertJsonPath('work_order.cancel_reason', 'Unit tidak jadi masuk workshop.');

        $this->assertDatabaseHas('work_orders', [
            'id' => $workOrder->id,
            'status' => 'cancelled',
            'cancel_reason' => 'Unit tidak jadi masuk workshop.',
        ]);

        $this->assertDatabaseHas('work_order_status_logs', [
            'wo_id' => $workOrder->id,
            'from_status' => 'approved',
            'to_status' => 'cancelled',
            'notes' => 'Unit tidak jadi masuk workshop.',
        ]);
    }

    private function actingAsApi(User $user): self
    {
        $token = $user->createToken('test-token')->plainTextToken;

        return $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->actingAs($user, 'sanctum');
    }
}
