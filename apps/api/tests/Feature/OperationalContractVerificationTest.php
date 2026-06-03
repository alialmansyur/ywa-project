<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\BreakdownReport;
use App\Models\Finding;
use App\Models\P2hSubmission;
use App\Models\P2hTemplate;
use App\Models\User;
use App\Services\Notification\NotificationDispatcherService;
use Database\Seeders\AppMenuSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperationalContractVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(UserSeeder::class);
        $this->seed(AppMenuSeeder::class);
    }

    public function test_p2h_contract_covers_list_detail_review_and_mobile_submission(): void
    {
        [$asset, $template] = $this->makeAssetAndTemplate();
        $operator = User::where('email', 'operator@tapg.local')->firstOrFail();
        $reviewer = User::where('email', 'supervisor@tapg.local')->firstOrFail();

        $submission = P2hSubmission::query()->create([
            'asset_id' => $asset->id,
            'operator_id' => $operator->id,
            'template_id' => $template->id,
            'template_version' => $template->version,
            'status' => 'submitted',
            'submitted_at' => now()->subHour(),
            'submission_date' => now()->toDateString(),
        ]);

        $submission->items()->createMany([
            ['group' => 'Engine', 'item_name' => 'Oli Mesin', 'condition' => 'ok'],
            ['group' => 'Safety', 'item_name' => 'Lampu Kerja', 'condition' => 'not_ok', 'notes' => 'Mati'],
        ]);

        $this->actingAsApi($operator)
            ->getJson("/api/v1/p2h?asset_id={$asset->id}&status=submitted&search={$asset->code}")
            ->assertOk()
            ->assertJsonPath('data.0.id', $submission->id)
            ->assertJsonPath('data.0.asset.id', $asset->id)
            ->assertJsonPath('data.0.operator.id', $operator->id)
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'asset_id',
                    'operator_id',
                    'template_id',
                    'status',
                    'created_at',
                    'asset' => ['id', 'name', 'code'],
                    'operator' => ['id', 'name'],
                ]],
                'current_page',
                'per_page',
                'total',
            ]);

        $this->actingAsApi($operator)
            ->getJson("/api/v1/p2h/{$submission->id}")
            ->assertOk()
            ->assertJsonPath('id', $submission->id)
            ->assertJsonPath('asset.id', $asset->id)
            ->assertJsonPath('operator.id', $operator->id)
            ->assertJsonCount(2, 'items')
            ->assertJsonStructure([
                'id',
                'asset' => ['id', 'code', 'name'],
                'operator' => ['id', 'name'],
                'template' => ['id', 'name', 'items'],
                'items' => [['id', 'item_name', 'condition', 'notes']],
            ]);

        $this->actingAsApi($reviewer)
            ->patchJson("/api/v1/p2h/{$submission->id}/review", [
                'status' => 'rejected',
            ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'VALIDATION_ERROR')
            ->assertJsonPath('errors.review_notes.0', 'The review notes field is required.');

        $this->actingAsApi($reviewer)
            ->patchJson("/api/v1/p2h/{$submission->id}/review", [
                'status' => 'rejected',
                'review_notes' => 'Lampu kerja wajib diperbaiki dulu.',
            ])
            ->assertOk()
            ->assertJsonPath('submission.status', 'rejected')
            ->assertJsonPath('submission.review_notes', 'Lampu kerja wajib diperbaiki dulu.');

        $payload = [
            'asset_id' => $asset->id,
            'template_id' => 999999,
            'submission_date' => now()->addDay()->toDateString(),
            'items' => [
                ['item_name' => 'Oli Mesin', 'condition' => 'ok'],
            ],
        ];

        $this->actingAsApi($operator)
            ->postJson('/api/v1/p2h', $payload)
            ->assertStatus(422)
            ->assertJsonPath('code', 'VALIDATION_ERROR');

        $validPayload = [
            'asset_id' => $asset->id,
            'template_id' => $template->id,
            'submission_date' => now()->addDay()->toDateString(),
            'items' => [
                ['group' => 'Engine', 'item_name' => 'Oli Mesin', 'condition' => 'ok'],
                ['group' => 'Safety', 'item_name' => 'Lampu Kerja', 'condition' => 'na'],
            ],
        ];

        $this->actingAsApi($operator)
            ->postJson('/api/v1/p2h', $validPayload)
            ->assertCreated()
            ->assertJsonPath('message', 'P2H berhasil disubmit.')
            ->assertJsonPath('submission.asset_id', $asset->id)
            ->assertJsonPath('submission.template_id', $template->id)
            ->assertJsonCount(2, 'submission.items');

        $this->actingAsApi($operator)
            ->postJson('/api/v1/p2h', $validPayload)
            ->assertStatus(422)
            ->assertJsonPath('message', 'P2H untuk aset ini pada tanggal tersebut sudah pernah disubmit oleh operator yang sama.');
    }

    public function test_findings_contract_covers_list_and_update_shape(): void
    {
        [$asset] = $this->makeAssetAndTemplate();
        $reporter = User::where('email', 'operator@tapg.local')->firstOrFail();

        $finding = Finding::query()->create([
            'code' => 'TEM-260603-0001',
            'asset_id' => $asset->id,
            'reporter_id' => $reporter->id,
            'section' => 'Hydraulic',
            'description' => 'Ada rembesan pada hose utama.',
            'status' => 'submitted',
            'photo_path' => 'findings/photos/sample.jpg',
        ]);

        $listResponse = $this->actingAsApi($reporter)
            ->getJson("/api/v1/findings?search={$asset->code}")
            ->assertOk()
            ->assertJsonPath('data.0.id', $finding->id)
            ->assertJsonPath('data.0.section', 'Hydraulic')
            ->assertJsonPath('data.0.reporter.id', $reporter->id)
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'code',
                    'section',
                    'description',
                    'status',
                    'resolution_notes',
                    'photo_url',
                    'created_at',
                    'asset' => ['id', 'code', 'name', 'plate_number'],
                    'reporter' => ['id', 'name'],
                ]],
            ]);

        $this->assertIsString($listResponse->json('data.0.photo_url'));
        $this->assertStringEndsWith('/findings/photos/sample.jpg', $listResponse->json('data.0.photo_url'));

        $this->actingAsApi($reporter)
            ->putJson("/api/v1/findings/{$finding->id}", [
                'status' => 'resolved',
                'resolution_notes' => 'Seal hose diganti dan area dibersihkan.',
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Temuan berhasil diperbarui.')
            ->assertJsonPath('data.status', 'resolved')
            ->assertJsonPath('data.resolution_notes', 'Seal hose diganti dan area dibersihkan.')
            ->assertJsonPath('data.reporter.id', $reporter->id);
    }

    public function test_breakdown_report_contract_covers_list_process_and_done_flow(): void
    {
        [$asset] = $this->makeAssetAndTemplate();
        $reporter = User::where('email', 'operator@tapg.local')->firstOrFail();
        $processor = User::where('email', 'supervisor@tapg.local')->firstOrFail();

        $report = BreakdownReport::query()->create([
            'report_no' => 'BDR-260603-0001',
            'asset_id' => $asset->id,
            'reporter_id' => $reporter->id,
            'location_label' => 'Pit A - Loading Point',
            'description' => 'Mesin mati mendadak saat operasi.',
            'status' => 'submitted',
        ]);

        $this->actingAsApi($processor)
            ->getJson("/api/v1/breakdown-reports?search={$asset->code}")
            ->assertOk()
            ->assertJsonPath('data.0.id', $report->id)
            ->assertJsonPath('data.0.location_label', 'Pit A - Loading Point')
            ->assertJsonPath('data.0.reporter.id', $reporter->id)
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'report_no',
                    'location_label',
                    'description',
                    'status',
                    'created_at',
                    'asset' => ['id', 'code', 'name'],
                    'reporter' => ['id', 'name'],
                    'work_order',
                ]],
            ]);

        $processResponse = $this->actingAsApi($processor)
            ->postJson("/api/v1/breakdown-reports/{$report->id}/process")
            ->assertOk()
            ->assertJsonPath('message', 'Laporan breakdown diproses menjadi Work Order.')
            ->assertJsonPath('data.status', 'processed');

        $workOrderId = $processResponse->json('data.work_order.id');
        $this->assertNotNull($workOrderId);

        $this->actingAsApi($processor)
            ->putJson("/api/v1/breakdown-reports/{$report->id}", [
                'status' => 'done',
                'location_label' => 'Pit A - Loading Point',
                'description' => 'Mesin mati mendadak saat operasi.' . "\n\n[FEEDBACK] Unit sudah dikirim ke workshop.",
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Laporan breakdown berhasil diperbarui.')
            ->assertJsonPath('data.status', 'done')
            ->assertJsonPath('data.work_order.id', $workOrderId);
    }

    public function test_breakdown_report_search_remains_scoped_by_other_filters(): void
    {
        [$asset] = $this->makeAssetAndTemplate();
        $reporter = User::where('email', 'operator@tapg.local')->firstOrFail();
        $otherReporter = User::where('email', 'mechanic@tapg.local')->firstOrFail();

        BreakdownReport::query()->create([
            'report_no' => 'BDR-260603-1001',
            'asset_id' => $asset->id,
            'reporter_id' => $reporter->id,
            'location_label' => 'Pit A',
            'description' => 'Engine overheat saat hauling.',
            'status' => 'submitted',
        ]);

        BreakdownReport::query()->create([
            'report_no' => 'BDR-260603-1002',
            'asset_id' => $asset->id,
            'reporter_id' => $otherReporter->id,
            'location_label' => 'Pit B',
            'description' => 'Engine overheat saat standby.',
            'status' => 'done',
        ]);

        $this->actingAsApi($reporter)
            ->getJson('/api/v1/breakdown-reports?mine=1&status=submitted&search=overheat')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.reporter.id', $reporter->id)
            ->assertJsonPath('data.0.status', 'submitted');
    }

    public function test_breakdown_report_search_supports_plate_number_fields(): void
    {
        [$asset] = $this->makeAssetAndTemplate();
        $reporter = User::where('email', 'operator@tapg.local')->firstOrFail();

        $report = BreakdownReport::query()->create([
            'report_no' => 'BDR-260603-2001',
            'asset_id' => $asset->id,
            'reporter_id' => $reporter->id,
            'location_label' => 'Pit C',
            'description' => 'Unit loss power saat climbing.',
            'status' => 'submitted',
        ]);

        $this->actingAsApi($reporter)
            ->getJson('/api/v1/breakdown-reports?search=B 1234 CD')
            ->assertOk()
            ->assertJsonPath('data.0.id', $report->id);

        $this->actingAsApi($reporter)
            ->getJson('/api/v1/breakdown-reports?search=KT 9876 XY')
            ->assertOk()
            ->assertJsonPath('data.0.id', $report->id);
    }

    public function test_workshop_registration_rejects_duplicate_open_registration_for_same_asset(): void
    {
        [$asset] = $this->makeAssetAndTemplate();
        $operator = User::where('email', 'operator@tapg.local')->firstOrFail();

        $payload = [
            'asset_id' => $asset->id,
            'title' => 'Registrasi Kedatangan - Excavator Test 001',
            'description' => 'Registrasi workshop dari mobile',
        ];

        $this->actingAsApi($operator)
            ->postJson('/api/v1/work-orders/register', $payload)
            ->assertCreated()
            ->assertJsonPath('work_order.asset_id', $asset->id)
            ->assertJsonPath('work_order.status', 'registered');

        $this->actingAsApi($operator)
            ->postJson('/api/v1/work-orders/register', $payload)
            ->assertStatus(422)
            ->assertJsonPath('message', 'Unit ini masih memiliki proses workshop yang belum selesai. Registrasi baru hanya bisa dibuat jika work order sebelumnya sudah selesai.');
    }

    public function test_auth_me_menu_access_and_notifications_contracts_remain_stable(): void
    {
        $admin = User::where('email', 'admin@tapg.local')->firstOrFail();

        AppNotification::query()->create([
            'user_id' => $admin->id,
            'type' => 'p2h_review',
            'title' => 'P2H membutuhkan review',
            'body' => 'Ada submission baru yang perlu ditinjau.',
            'data' => NotificationDispatcherService::buildRouteTargetPayload([
                'entity_type' => 'p2h',
                'entity_id' => 123,
            ], [
                'mobile' => [
                    'route_name' => 'mechanic.index',
                    'route' => '/mechanic',
                    'params' => [],
                ],
                'admin' => [
                    'route_name' => 'p2h.index',
                    'route' => '/p2h',
                    'params' => [],
                ],
            ], '/mechanic', '/p2h'),
            'is_read' => false,
        ]);

        $this->actingAsApi($admin)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('id', $admin->id)
            ->assertJsonPath('email', 'admin@tapg.local')
            ->assertJsonPath('roles.0', 'admin')
            ->assertJsonStructure([
                'id',
                'name',
                'email',
                'phone',
                'avatar',
                'avatar_url',
                'is_active',
                'roles',
                'permissions',
                'duty_location',
            ]);

        $this->actingAsApi($admin)
            ->getJson('/api/v1/settings/menu-access?category=admin')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'menu_key',
                    'label',
                    'route',
                    'icon',
                    'children',
                ]],
            ])
            ->assertJsonFragment([
                'menu_key' => 'p2h',
                'route' => '/p2h',
            ]);

        $this->actingAsApi($admin)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('notifications.data.0.data.admin_route', '/p2h')
            ->assertJsonPath('notifications.data.0.data.route', '/mechanic')
            ->assertJsonPath('notifications.data.0.data.target.admin.route', '/p2h')
            ->assertJsonPath('notifications.data.0.data.target.mobile.route', '/mechanic')
            ->assertJsonStructure([
                'unread_count',
                'notifications' => [
                    'data' => [[
                        'id',
                        'type',
                        'title',
                        'body',
                        'data',
                        'is_read',
                        'read_at',
                        'created_at',
                    ]],
                    'current_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    private function actingAsApi(User $user): self
    {
        $token = $user->createToken('test-token')->plainTextToken;

        return $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->actingAs($user, 'sanctum');
    }

    private function makeAssetAndTemplate(): array
    {
        $category = AssetCategory::query()->create([
            'name' => 'Excavator',
            'is_active' => true,
        ]);

        $asset = Asset::query()->create([
            'code' => 'EXC-T-001',
            'name' => 'Excavator Test 001',
            'category_id' => $category->id,
            'status' => 'active',
            'plate_number' => 'B 1234 CD',
            'veh_plate_no' => 'KT 9876 XY',
        ]);

        $operator = User::where('email', 'operator@tapg.local')->firstOrFail();

        $template = P2hTemplate::query()->create([
            'name' => 'P2H Excavator',
            'asset_category_id' => $category->id,
            'items' => [
                ['group' => 'Engine', 'item_name' => 'Oli Mesin', 'type' => 'boolean'],
                ['group' => 'Safety', 'item_name' => 'Lampu Kerja', 'type' => 'boolean'],
            ],
            'applies_to_all_assets' => false,
            'version' => 1,
            'effective_from' => now()->subDay()->toDateString(),
            'is_active' => true,
            'created_by' => $operator->id,
            'updated_by' => $operator->id,
        ]);

        return [$asset, $template];
    }
}
