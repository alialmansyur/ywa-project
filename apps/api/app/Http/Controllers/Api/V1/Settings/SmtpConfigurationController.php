<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

/**
 * @tags Settings - SMTP
 */
class SmtpConfigurationController extends Controller
{
    public function index(): JsonResponse
    {
        $data = DB::table('smtp_configurations')->orderByDesc('is_default')->orderBy('name')->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'name' => $row->name,
                'host' => $row->host,
                'port' => $row->port,
                'username' => $row->username,
                'encryption' => $row->encryption,
                'from_name' => $row->from_name,
                'from_email' => $row->from_email,
                'is_enabled' => (bool) $row->is_enabled,
                'is_default' => (bool) $row->is_default,
                'last_test_at' => $row->last_test_at,
                'last_test_status' => $row->last_test_status,
            ];
        })->values();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:500',
            'encryption' => 'required|in:none,ssl,tls',
            'from_name' => 'required|string|max:255',
            'from_email' => 'required|email|max:255',
            'is_enabled' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            DB::table('smtp_configurations')->update(['is_default' => false]);
        }

        $id = DB::table('smtp_configurations')->insertGetId([
            'name' => $validated['name'],
            'host' => $validated['host'],
            'port' => $validated['port'],
            'username' => $validated['username'] ?? null,
            'password_encrypted' => !empty($validated['password']) ? Crypt::encryptString($validated['password']) : null,
            'encryption' => $validated['encryption'],
            'from_name' => $validated['from_name'],
            'from_email' => $validated['from_email'],
            'is_enabled' => (bool) ($validated['is_enabled'] ?? false),
            'is_default' => (bool) ($validated['is_default'] ?? false),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'SMTP configuration created.', 'id' => $id], 201);
    }

    public function show(int $id): JsonResponse
    {
        $row = DB::table('smtp_configurations')->where('id', $id)->first();
        abort_if(!$row, 404, 'SMTP config not found.');

        return response()->json([
            'data' => [
                'id' => $row->id,
                'name' => $row->name,
                'host' => $row->host,
                'port' => $row->port,
                'username' => $row->username,
                'encryption' => $row->encryption,
                'from_name' => $row->from_name,
                'from_email' => $row->from_email,
                'is_enabled' => (bool) $row->is_enabled,
                'is_default' => (bool) $row->is_default,
                'last_test_at' => $row->last_test_at,
                'last_test_status' => $row->last_test_status,
            ],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $row = DB::table('smtp_configurations')->where('id', $id)->first();
        abort_if(!$row, 404, 'SMTP config not found.');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:500',
            'encryption' => 'required|in:none,ssl,tls',
            'from_name' => 'required|string|max:255',
            'from_email' => 'required|email|max:255',
            'is_enabled' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            DB::table('smtp_configurations')->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $payload = [
            'name' => $validated['name'],
            'host' => $validated['host'],
            'port' => $validated['port'],
            'username' => $validated['username'] ?? null,
            'encryption' => $validated['encryption'],
            'from_name' => $validated['from_name'],
            'from_email' => $validated['from_email'],
            'is_enabled' => (bool) ($validated['is_enabled'] ?? false),
            'is_default' => (bool) ($validated['is_default'] ?? false),
            'updated_by' => $request->user()->id,
            'updated_at' => now(),
        ];

        if (!empty($validated['password'])) {
            $payload['password_encrypted'] = Crypt::encryptString($validated['password']);
        }

        DB::table('smtp_configurations')->where('id', $id)->update($payload);

        return response()->json(['message' => 'SMTP configuration updated.']);
    }

    public function testEmail(Request $request, int $id): JsonResponse
    {
        $request->validate(['to_email' => 'required|email|max:255']);
        $row = DB::table('smtp_configurations')->where('id', $id)->first();
        abort_if(!$row, 404, 'SMTP config not found.');

        DB::table('smtp_test_email_logs')->insert([
            'smtp_configuration_id' => $id,
            'to_email' => (string) $request->input('to_email'),
            'status' => 'success',
            'error_message' => null,
            'sent_at' => now(),
            'created_by' => $request->user()->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('smtp_configurations')->where('id', $id)->update([
            'last_test_at' => now(),
            'last_test_status' => 'success',
            'updated_by' => $request->user()->id,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Test email berhasil dicatat.']);
    }
}
