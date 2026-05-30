<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * @tags Settings - System
 */
class SystemSettingController extends Controller
{
    private const UPLOAD_REQUIRED_KEYS = [
        'app.logo_url',
        'app.favicon_url',
    ];

    public function index(Request $request): JsonResponse
    {
        $query = DB::table('system_settings');

        if ($request->filled('search')) {
            $search = strtolower((string) $request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(`key`) like ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(label) like ?', ["%{$search}%"]);
            });
        }

        if ($request->filled('scope')) {
            $query->where('scope', (string) $request->input('scope'));
        }

        if ($request->filled('type')) {
            $query->where('type', (string) $request->input('type'));
        }

        $data = $query->orderBy('scope')->orderBy('key')->get()->map(function ($row) {
            return $this->transformRow($row);
        })->values();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request, true);

        $id = DB::table('system_settings')->insertGetId([
            'key' => $validated['key'],
            'label' => $validated['label'],
            'value_text' => $validated['value_text'],
            'value_json' => $validated['value_json'],
            'type' => $validated['type'],
            'scope' => $validated['scope'],
            'module_code' => $validated['module_code'],
            'validation_rules' => $validated['validation_rules'],
            'is_secret' => $validated['is_secret'],
            'is_editable' => $validated['is_editable'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'System setting created.', 'id' => $id], 201);
    }

    public function show(int $id): JsonResponse
    {
        $row = DB::table('system_settings')->where('id', $id)->first();
        abort_if(!$row, 404, 'System setting not found.');

        return response()->json(['data' => $this->transformRow($row)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $row = DB::table('system_settings')->where('id', $id)->first();
        abort_if(!$row, 404, 'System setting not found.');

        $validated = $this->validatePayload($request, false);

        DB::table('system_settings')->where('id', $id)->update([
            'key' => $validated['key'],
            'label' => $validated['label'],
            'value_text' => $validated['value_text'],
            'value_json' => $validated['value_json'],
            'type' => $validated['type'],
            'scope' => $validated['scope'],
            'module_code' => $validated['module_code'],
            'validation_rules' => $validated['validation_rules'],
            'is_secret' => $validated['is_secret'],
            'is_editable' => $validated['is_editable'],
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'System setting updated.']);
    }

    /**
     * Upload file setting (logo, favicon, dst).
     */
    public function upload(Request $request, int $id): JsonResponse
    {
        $row = DB::table('system_settings')->where('id', $id)->first();
        abort_if(!$row, 404, 'System setting not found.');

        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,svg,webp,ico|max:2048',
        ]);

        $path = $request->file('file')->store('system-settings', 'public');
        $publicUrl = Storage::disk('public')->url($path);

        DB::table('system_settings')->where('id', $id)->update([
            'type' => 'url',
            'value_text' => $publicUrl,
            'value_json' => null,
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'File uploaded.',
            'data' => [
                'id' => $id,
                'url' => $publicUrl,
            ],
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        DB::table('system_settings')->where('id', $id)->delete();
        return response()->json(['message' => 'System setting deleted.']);
    }

    private function validatePayload(Request $request, bool $isCreate): array
    {
        $rules = [
            'key' => ($isCreate ? 'required' : 'required').'|string|max:255|'.($isCreate ? 'unique:system_settings,key' : 'unique:system_settings,key,'.$request->route('id')),
            'label' => 'required|string|max:255',
            'type' => 'required|in:string,number,boolean,json,email,url,select',
            'scope' => 'required|in:global,module',
            'module_code' => 'nullable|string|max:100',
            'value' => 'nullable',
            'validation_rules' => 'nullable|array',
            'is_secret' => 'boolean',
            'is_editable' => 'boolean',
            'value_file' => 'nullable|file|mimes:jpg,jpeg,png,svg,webp,ico|max:2048',
        ];

        $data = $request->validate($rules);

        $valueText = null;
        $valueJson = null;
        $type = (string) $data['type'];
        $value = $data['value'] ?? null;
        $key = (string) $data['key'];

        if ($request->hasFile('value_file')) {
            $path = $request->file('value_file')->store('system-settings', 'public');
            $valueText = Storage::disk('public')->url($path);
            $valueJson = null;
            $type = 'url';
        } elseif (in_array($type, ['json', 'select'], true)) {
            $valueJson = $value === null ? null : (is_array($value) ? json_encode($value) : (string) $value);
        } else {
            if (is_bool($value)) {
                $valueText = $value ? 'true' : 'false';
            } elseif ($value !== null) {
                $valueText = (string) $value;
            }
        }

        if (in_array($key, self::UPLOAD_REQUIRED_KEYS, true) && empty($valueText) && empty($valueJson)) {
            abort(422, 'Setting ini wajib diisi via upload file.');
        }

        return [
            'key' => (string) $data['key'],
            'label' => (string) $data['label'],
            'value_text' => $valueText,
            'value_json' => $valueJson,
            'type' => $type,
            'scope' => (string) $data['scope'],
            'module_code' => $data['module_code'] ?? null,
            'validation_rules' => isset($data['validation_rules']) ? json_encode($data['validation_rules']) : null,
            'is_secret' => (bool) ($data['is_secret'] ?? false),
            'is_editable' => (bool) ($data['is_editable'] ?? true),
        ];
    }

    private function transformRow(object $row): array
    {
        $value = $row->value_json ?? $row->value_text;

        return [
            'id' => $row->id,
            'key' => $row->key,
            'label' => $row->label,
            'type' => $row->type,
            'scope' => $row->scope,
            'module_code' => $row->module_code,
            'value' => $row->is_secret ? null : $value,
            'is_secret' => (bool) $row->is_secret,
            'is_editable' => (bool) $row->is_editable,
            'validation_rules' => $row->validation_rules ? json_decode($row->validation_rules, true) : null,
            'updated_at' => $row->updated_at,
        ];
    }
}
