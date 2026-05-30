<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserPushToken;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * @tags Auth
 */
class AuthController extends Controller
{
    private function issueAccessToken(User $user, string $clientCategory): array
    {
        $tokenName = 'api-token:'.$clientCategory;

        // Batasi login ganda hanya dalam kategori yang sama (web-mobile tetap boleh bersamaan).
        $user->tokens()
            ->where('name', $tokenName)
            ->delete();

        $tokenLifetimeMinutes = (int) config('sanctum.expiration', 1440);
        if ($tokenLifetimeMinutes <= 0) {
            $tokenLifetimeMinutes = 1440;
        }
        $tokenExpiresAt = now()->addMinutes($tokenLifetimeMinutes);
        $token = $user->createToken($tokenName, ['*'], $tokenExpiresAt)->plainTextToken;

        return [
            'token' => $token,
            'expires_at' => $tokenExpiresAt,
        ];
    }

    private function resolveClientCategory(Request $request): string
    {
        $category = strtolower((string) ($request->input('client_category') ?: $request->header('X-Client-Category', '')));
        return in_array($category, ['web', 'mobile'], true) ? $category : 'web';
    }

    private function resolveDutyLocation(User $user): ?string
    {
        $site = $user->profile?->site_location;
        if (is_string($site) && trim($site) !== '') {
            return $site;
        }

        $activeAssignment = $user->assetAssignments
            ?->whereNull('released_at')
            ->sortByDesc('assigned_at')
            ->first();

        $assetLocation = $activeAssignment?->asset?->latestLocation?->address;
        if (is_string($assetLocation) && trim($assetLocation) !== '') {
            return $assetLocation;
        }

        return null;
    }

    private function buildUserPayload(User $user): array
    {
        $user->loadMissing(['roles', 'profile', 'assetAssignments.asset.latestLocation']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'avatar_url' => $this->resolveFileUrl($user->avatar),
            'email_verified_at' => optional($user->email_verified_at)?->toISOString(),
            'is_active' => $user->is_active,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'duty_location' => $this->resolveDutyLocation($user),
        ];
    }

    private function s3Disk(): Filesystem
    {
        return Storage::disk('s3');
    }

    private function resolveFileUrl(?string $path): ?string
    {
        if (!is_string($path) || trim($path) === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $rawUrl = (string) $this->s3Disk()->url($path);
        $host = parse_url($rawUrl, PHP_URL_HOST) ?: '';

        if ($host === 'minio' || str_ends_with($host, '.minio')) {
            $bucket = (string) Config::get('filesystems.disks.s3.bucket', '');
            $publicBase = rtrim((string) env('MINIO_PUBLIC_URL', 'http://localhost:9000'), '/');
            return $publicBase . '/' . $bucket . '/' . ltrim($path, '/');
        }

        return $rawUrl;
    }

    private function storeToS3(UploadedFile $file, string $directory): string
    {
        $disk = Storage::disk('s3');

        if (method_exists($disk, 'getClient') && method_exists($disk, 'getConfig')) {
            $bucket = (string) Config::get('filesystems.disks.s3.bucket', '');
            $client = $disk->getClient();
            try {
                $client->headBucket(['Bucket' => $bucket]);
            } catch (\Throwable $e) {
                $client->createBucket(['Bucket' => $bucket]);
            }
        }

        $path = $disk->putFile($directory, $file);
        if (is_string($path) && trim($path) !== '') {
            return $path;
        }

        $fallback = uniqid('avatar_', true) . '_' . $file->hashName();
        $stored = $disk->putFileAs($directory, $file, $fallback);
        if (is_string($stored) && trim($stored) !== '') {
            return $stored;
        }

        throw new \RuntimeException('Upload avatar ke MinIO gagal.');
    }

    /**
     * Login user dan generate Sanctum token
     *
     * @unauthenticated
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'login'    => 'nullable|string|max:255',
            'email'    => 'nullable|string|max:255',
            'password' => 'required|string',
            'client_category' => 'nullable|string|in:web,mobile',
        ]);

        $loginValue = trim((string) ($validated['login'] ?? $validated['email'] ?? ''));
        if ($loginValue === '') {
            return response()->json([
                'code' => 'AUTH_LOGIN_REQUIRED',
                'message' => 'Email atau username wajib diisi.',
            ], 422);
        }

        $normalizedLogin = strtolower($loginValue);
        $isEmailLogin = filter_var($normalizedLogin, FILTER_VALIDATE_EMAIL) !== false;

        $user = User::query()
            ->when($isEmailLogin, fn ($q) => $q->whereRaw('LOWER(email) = ?', [$normalizedLogin]))
            ->when(! $isEmailLogin, fn ($q) => $q->whereRaw('LOWER(SUBSTRING_INDEX(email, "@", 1)) = ?', [$normalizedLogin]))
            ->first();

        if (! $user) {
            return response()->json([
                'code' => 'AUTH_USER_NOT_FOUND',
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        if (! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'code' => 'AUTH_INVALID_PASSWORD',
                'message' => 'Password yang Anda masukkan salah.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'code' => 'AUTH_USER_INACTIVE',
                'message' => 'Akun tidak aktif. Silakan hubungi administrator.',
            ], 403);
        }

        $clientCategory = $this->resolveClientCategory($request);
        $issued = $this->issueAccessToken($user, $clientCategory);
        $token = $issued['token'];
        $tokenExpiresAt = $issued['expires_at'];

        return response()->json([
            'code' => 'AUTH_LOGIN_SUCCESS',
            'message'      => 'Login berhasil.',
            'token_type'   => 'Bearer',
            'access_token' => $token,
            'token'        => $token, // backward compatibility
            'session_category' => $clientCategory,
            'expires_at' => $tokenExpiresAt->toISOString(),
            'expires_in_seconds' => $tokenExpiresAt->diffInSeconds(now()),
            'user'         => $this->buildUserPayload($user),
        ]);
    }

    /**
     * Login dashboard web menggunakan PIN 6 digit.
     *
     * @unauthenticated
     */
    public function dashboardTokenLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pin' => ['required', 'string', 'regex:/^\d{6}$/'],
        ]);

        $dashboardToken = DB::table('dashboard_access_tokens')
            ->where('is_active', true)
            ->orderByDesc('id')
            ->first();

        if (! $dashboardToken) {
            return response()->json([
                'code' => 'DASHBOARD_TOKEN_NOT_CONFIGURED',
                'message' => 'Token dashboard belum dikonfigurasi.',
            ], 404);
        }

        if (!empty($dashboardToken->expires_at) && now()->greaterThan($dashboardToken->expires_at)) {
            return response()->json([
                'code' => 'DASHBOARD_TOKEN_EXPIRED',
                'message' => 'Token dashboard sudah kedaluwarsa.',
            ], 401);
        }

        $isValid = is_string($dashboardToken->token_hash) && Hash::check($validated['pin'], $dashboardToken->token_hash);
        if (! $isValid) {
            return response()->json([
                'code' => 'DASHBOARD_TOKEN_INVALID',
                'message' => 'PIN dashboard tidak valid.',
            ], 401);
        }

        $user = User::query()->find($dashboardToken->user_id);
        if (! $user || ! $user->is_active) {
            return response()->json([
                'code' => 'DASHBOARD_TOKEN_USER_INVALID',
                'message' => 'User token dashboard tidak aktif atau tidak ditemukan.',
            ], 403);
        }

        if (! $user->hasRole('admin', 'web')) {
            return response()->json([
                'code' => 'DASHBOARD_TOKEN_ROLE_INVALID',
                'message' => 'Token dashboard hanya valid untuk user role admin.',
            ], 403);
        }

        DB::table('dashboard_access_tokens')
            ->where('id', $dashboardToken->id)
            ->update([
                'last_used_at' => now(),
                'updated_at' => now(),
            ]);

        $clientCategory = 'web';
        $issued = $this->issueAccessToken($user, $clientCategory);
        $token = $issued['token'];
        $tokenExpiresAt = $issued['expires_at'];

        return response()->json([
            'code' => 'AUTH_LOGIN_SUCCESS',
            'message' => 'Login berhasil.',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'token' => $token,
            'session_category' => $clientCategory,
            'expires_at' => $tokenExpiresAt->toISOString(),
            'expires_in_seconds' => $tokenExpiresAt->diffInSeconds(now()),
            'user' => $this->buildUserPayload($user),
        ]);
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->input('fcm_token');
        if (is_string($token) && trim($token) !== '') {
            UserPushToken::query()
                ->where('user_id', $request->user()->id)
                ->where('push_token', trim($token))
                ->update([
                    'is_active' => false,
                    'last_used_at' => now(),
                ]);
        }

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * Get authenticated user profile
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json($this->buildUserPayload($user));
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'email'        => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'phone'        => 'sometimes|string|max:20',
            'password'     => 'sometimes|string|min:8|confirmed',
            'avatar'       => 'sometimes|image|max:2048',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $this->storeToS3($request->file('avatar'), 'avatars');
        }

        $user->update($validated);
        $fresh = $user->fresh(['roles']);

        return response()->json([
            'message' => 'Profil diperbarui.',
            'user' => $this->buildUserPayload($fresh),
        ]);
    }

    /**
     * Change password for authenticated user
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();
        if (! Hash::check($validated['old_password'], $user->password)) {
            throw ValidationException::withMessages([
                'old_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    /**
     * Update FCM token for push notification
     */
    public function updateFcmToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fcm_token' => 'required|string|max:512',
            'provider' => 'nullable|string|in:expo,fcm',
            'platform' => 'nullable|string|max:32',
            'device_id' => 'nullable|string|max:191',
            'is_active' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $token = trim((string) $validated['fcm_token']);
        $provider = $validated['provider'] ?? 'expo';
        $isActive = array_key_exists('is_active', $validated) ? (bool) $validated['is_active'] : true;

        UserPushToken::query()->updateOrCreate(
            ['push_token' => $token],
            [
                'user_id' => $user->id,
                'provider' => $provider,
                'platform' => $validated['platform'] ?? null,
                'device_id' => $validated['device_id'] ?? null,
                'is_active' => $isActive,
                'last_used_at' => now(),
            ]
        );

        // Backward compatibility untuk implementasi lama single-token.
        if ($isActive) {
            $user->update(['fcm_token' => $token]);
        } elseif ($user->fcm_token === $token) {
            $user->update(['fcm_token' => null]);
        }

        return response()->json(['message' => 'FCM token diperbarui.']);
    }

    /**
     * Request OTP untuk verifikasi/perubahan email.
     */
    public function requestEmailOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $request->user()->id,
        ]);

        $otp = (string) random_int(100000, 999999);
        $cacheKey = 'email_otp:' . $request->user()->id;

        Cache::put($cacheKey, [
            'email' => $validated['email'],
            'otp' => $otp,
        ], now()->addMinutes(10));

        // sementara via log supaya flow mobile bisa berjalan tanpa tergantung SMTP
        Log::info('Email OTP generated', [
            'user_id' => $request->user()->id,
            'email' => $validated['email'],
            'otp' => $otp,
        ]);

        // Send OTP using EmailTemplateService
        $emailService = app(\App\Services\EmailTemplateService::class);
        $sent = $emailService->sendByCode('auth.otp', $validated['email'], [
            'user_name' => $request->user()->name,
            'otp_code' => $otp,
        ]);
        if (! $sent) {
            Mail::raw("Kode OTP Anda: {$otp}. Berlaku selama 10 menit.", function ($message) use ($validated) {
                $message->to($validated['email'])->subject('Kode OTP Verifikasi Email');
            });
        }

        $response = [
            'message' => 'OTP telah dikirim. Berlaku 10 menit.',
            'expires_in_seconds' => 600,
        ];

        if (app()->environment('local')) {
            $response['debug_otp'] = $otp;
        }

        return response()->json($response);
    }

    /**
     * Verify OTP email lalu update email user.
     */
    public function verifyEmailOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $request->user()->id,
            'otp' => 'required|string|size:6',
        ]);

        $cacheKey = 'email_otp:' . $request->user()->id;
        $payload = Cache::get($cacheKey);

        if (! $payload || ($payload['email'] ?? null) !== $validated['email'] || ($payload['otp'] ?? null) !== $validated['otp']) {
            throw ValidationException::withMessages([
                'otp' => ['OTP tidak valid atau sudah kedaluwarsa.'],
            ]);
        }

        $user = $request->user();
        $user->update([
            'email' => $validated['email'],
            'email_verified_at' => now(),
        ]);

        Cache::forget($cacheKey);

        return response()->json([
            'message' => 'Email berhasil diverifikasi.',
            'user' => $this->buildUserPayload($user->fresh()),
        ]);
    }

    /**
     * Forgot password — kirim link reset
     *
     * @unauthenticated
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        
        $user = User::where('email', $request->email)->first();

        // Generate token
        $token = Str::random(64);
        
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $resetLink = config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        $emailService = app(\App\Services\EmailTemplateService::class);
        $emailService->sendByCode('auth.reset_password', $user->email, [
            'user_name' => $user->name,
            'reset_link' => $resetLink,
        ]);

        return response()->json(['message' => 'Link reset password telah dikirim ke email Anda.']);
    }

    /**
     * Reset password dengan token
     *
     * @unauthenticated
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => 'required|string',
            'email'                 => 'required|email',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Token reset password tidak valid atau sudah kadaluarsa.'
            ], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password berhasil direset.']);
    }
}
