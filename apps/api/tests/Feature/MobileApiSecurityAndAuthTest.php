<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MobileApiSecurityAndAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Keep auth barrier active, but avoid rate-limit interference across login test cases.
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    public function test_login_returns_specific_error_when_user_not_found(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'missing@tapg.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'code' => 'AUTH_USER_NOT_FOUND',
            ]);
    }

    public function test_login_returns_specific_error_when_password_is_wrong(): void
    {
        User::factory()->create([
            'email' => 'operator@tapg.com',
            'password' => Hash::make('password-benarnya'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'operator@tapg.com',
            'password' => 'password-salah',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'code' => 'AUTH_INVALID_PASSWORD',
            ]);
    }

    public function test_login_returns_specific_error_when_user_inactive(): void
    {
        User::factory()->create([
            'email' => 'inactive@tapg.com',
            'password' => Hash::make('password123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'inactive@tapg.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'code' => 'AUTH_USER_INACTIVE',
            ]);
    }

    public function test_mobile_endpoints_block_unauthenticated_access(): void
    {
        $cases = [
            ['GET', '/api/v1/auth/me'],
            ['GET', '/api/v1/assets'],
            ['GET', '/api/v1/assets/assignment/current'],
            ['GET', '/api/v1/dashboard/overview'],
            ['GET', '/api/v1/work-orders'],
            ['GET', '/api/v1/p2h'],
            ['GET', '/api/v1/schedules/upcoming'],
            ['GET', '/api/v1/notifications'],
            ['GET', '/api/v1/guides'],
            ['GET', '/api/v1/findings'],
            ['GET', '/api/v1/breakdown-reports'],
            ['GET', '/api/v1/spare-parts'],
            ['GET', '/api/v1/inventory'],
        ];

        foreach ($cases as [$method, $uri]) {
            $response = $this->json($method, $uri);
            $response->assertStatus(401)
                ->assertJsonPath('code', 'UNAUTHORIZED');
        }
    }
}
