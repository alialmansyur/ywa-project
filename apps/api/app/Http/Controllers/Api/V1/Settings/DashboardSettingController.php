<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @tags Settings - Dashboard
 */
class DashboardSettingController extends Controller
{
    private const SETTING_KEY = 'dashboard.web.settings';

    private const DEFAULT_SETTINGS = [
        'headerTitle' => 'YWA Workshop Operations Dashboard',
        'headerSubtitle' => 'Monitoring antrean, flow proses, dan preventive secara realtime.',
        'sliderDurationSec' => 20,
        'slide1ScrollSpeed' => 24,
        'slide1ScrollDelaySec' => 1,
        'slide1ScrollLoopPauseMs' => 1000,
        'runningText' => 'ALERT: UNIT OVER SLA MENJADI PRIORITAS PENANGANAN|PERHATIAN: UNIT ON HOLD WAJIB DITINDAKLANJUTI DENGAN ETA|INFO: MONITOR STEP BOTTLENECK SECARA BERKALA|SCHEDULE: PREVENTIVE DUE TODAY HARUS DITUNTASKAN',
        'slide1Title' => 'FIFO Workshop Board',
        'slide1Desc' => 'Antrian unit aktif dari registrasi hingga serah terima (auto-hide saat selesai).',
        'slide2Title' => 'Workshop Control Tower',
        'slide2Desc' => 'Paritas layout control tower admin, mode view-only.',
        'slide3Title' => 'Preventive & Operational KPI',
        'slide3Desc' => 'Fokus due schedule, bottleneck, dan performa harian workshop.',
        'slide4Title' => 'Dashboard Analyst',
        'slide4Desc' => 'Trend 30 hari: WO, downtime, dan bottleneck.',
    ];

    public function show(): JsonResponse
    {
        $row = DB::table('system_settings')
            ->where('key', self::SETTING_KEY)
            ->first();

        return response()->json([
            'data' => $this->resolveSettings($row),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'headerTitle' => 'required|string|max:255',
            'headerSubtitle' => 'nullable|string|max:255',
            'sliderDurationSec' => 'required|integer|min:5|max:600',
            'slide1ScrollSpeed' => 'required|integer|min:4|max:120',
            'slide1ScrollDelaySec' => 'required|integer|min:0|max:10',
            'slide1ScrollLoopPauseMs' => 'required|integer|min:0|max:5000',
            'runningText' => 'nullable|string',
            'slide1Title' => 'required|string|max:255',
            'slide1Desc' => 'nullable|string|max:255',
            'slide2Title' => 'required|string|max:255',
            'slide2Desc' => 'nullable|string|max:255',
            'slide3Title' => 'nullable|string|max:255',
            'slide3Desc' => 'nullable|string|max:255',
            'slide4Title' => 'nullable|string|max:255',
            'slide4Desc' => 'nullable|string|max:255',
        ]);

        $settings = $this->resolveSettings((object) [
            'value_json' => json_encode($validated),
        ]);

        DB::table('system_settings')->updateOrInsert(
            ['key' => self::SETTING_KEY],
            [
                'label' => 'Dashboard Web Settings',
                'type' => 'json',
                'scope' => 'module',
                'module_code' => 'dashboard',
                'value_text' => null,
                'value_json' => json_encode($settings),
                'validation_rules' => null,
                'is_secret' => false,
                'is_editable' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Dashboard setting updated.',
            'data' => $settings,
        ]);
    }

    private function resolveSettings(?object $row): array
    {
        $raw = [];
        if ($row && !empty($row->value_json)) {
            $decoded = json_decode((string) $row->value_json, true);
            if (is_array($decoded)) {
                $raw = $decoded;
            }
        }

        return [
            'headerTitle' => (string) ($raw['headerTitle'] ?? self::DEFAULT_SETTINGS['headerTitle']),
            'headerSubtitle' => (string) ($raw['headerSubtitle'] ?? self::DEFAULT_SETTINGS['headerSubtitle']),
            'sliderDurationSec' => max(5, (int) ($raw['sliderDurationSec'] ?? self::DEFAULT_SETTINGS['sliderDurationSec'])),
            'slide1ScrollSpeed' => max(4, min(120, (int) ($raw['slide1ScrollSpeed'] ?? self::DEFAULT_SETTINGS['slide1ScrollSpeed']))),
            'slide1ScrollDelaySec' => max(0, min(10, (int) ($raw['slide1ScrollDelaySec'] ?? self::DEFAULT_SETTINGS['slide1ScrollDelaySec']))),
            'slide1ScrollLoopPauseMs' => max(0, min(5000, (int) ($raw['slide1ScrollLoopPauseMs'] ?? self::DEFAULT_SETTINGS['slide1ScrollLoopPauseMs']))),
            'runningText' => (string) ($raw['runningText'] ?? self::DEFAULT_SETTINGS['runningText']),
            'slide1Title' => (string) ($raw['slide1Title'] ?? self::DEFAULT_SETTINGS['slide1Title']),
            'slide1Desc' => (string) ($raw['slide1Desc'] ?? self::DEFAULT_SETTINGS['slide1Desc']),
            'slide2Title' => (string) ($raw['slide2Title'] ?? self::DEFAULT_SETTINGS['slide2Title']),
            'slide2Desc' => (string) ($raw['slide2Desc'] ?? self::DEFAULT_SETTINGS['slide2Desc']),
            'slide3Title' => (string) ($raw['slide3Title'] ?? self::DEFAULT_SETTINGS['slide3Title']),
            'slide3Desc' => (string) ($raw['slide3Desc'] ?? self::DEFAULT_SETTINGS['slide3Desc']),
            'slide4Title' => (string) ($raw['slide4Title'] ?? self::DEFAULT_SETTINGS['slide4Title']),
            'slide4Desc' => (string) ($raw['slide4Desc'] ?? self::DEFAULT_SETTINGS['slide4Desc']),
        ];
    }
}
