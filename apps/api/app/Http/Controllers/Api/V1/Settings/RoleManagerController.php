<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * @tags Settings - Role Manager
 */
class RoleManagerController extends Controller
{
    private function resolvePermissionGuard(Request $request): ?string
    {
        $category = strtolower((string) $request->query('category', ''));
        if ($category === 'admin' || $category === 'web') {
            return 'web';
        }

        return $category === 'mobile' ? 'mobile' : null;
    }

    private function resolveMenuPlatforms(Request $request): array
    {
        $category = strtolower((string) $request->query('category', ''));

        if ($category === 'mobile') {
            return ['mobile'];
        }

        if ($category === 'web') {
            return ['web'];
        }

        if ($category === 'admin') {
            return ['admin'];
        }

        return [];
    }

    private function resolveAccessMode(User $user): string
    {
        return DB::table('user_access_modes')->where('user_id', $user->id)->value('access_mode') ?? 'role';
    }

    public function permissions(Request $request): JsonResponse
    {
        $guard = $this->resolvePermissionGuard($request);
        $query = Permission::query()
            ->select('id', 'name', 'guard_name')
            ->orderBy('name');

        if ($guard) {
            $query->where('guard_name', $guard);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function roles(Request $request): JsonResponse
    {
        $guard = $this->resolvePermissionGuard($request);
        $query = Role::query()
            ->with('permissions:id,name')
            ->orderBy('name');

        if ($guard) {
            $query->where('guard_name', $guard);
        }

        $roles = $query->get()
            ->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => $role->permissions->map(fn ($permission) => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                ])->values(),
            ]);

        return response()->json(['data' => $roles]);
    }

    public function permissionMatrix(Request $request): JsonResponse
    {
        $guard = $this->resolvePermissionGuard($request);
        $platforms = $this->resolveMenuPlatforms($request);
        $menus = DB::table('app_menus')
            ->where('is_active', true)
            ->when(!empty($platforms), function ($query) use ($platforms) {
                $query->whereIn('platform', $platforms);
            })
            ->orderBy('parent_id')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $permissionQuery = Permission::query()->select('id', 'name')->orderBy('name');
        if ($guard) {
            $permissionQuery->where('guard_name', $guard);
        }
        $allPermissions = $permissionQuery->get();
        $servicesByMenuId = DB::table('app_menu_services')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->groupBy('menu_id');

        $actions = ['view', 'create', 'update', 'delete', 'assign', 'refresh', 'manage', 'edit', 'review', 'execute'];

        $matrix = $menus->map(function ($menu) use ($allPermissions, $servicesByMenuId, $actions) {
            $menuServices = $servicesByMenuId->get($menu->id, collect());
            $matched = $menuServices
                ->pluck('permission_name')
                ->filter()
                ->unique()
                ->map(function ($name) use ($allPermissions) {
                    $permission = $allPermissions->firstWhere('name', $name);
                    return ['id' => $permission?->id, 'name' => $name];
                })
                ->values();

            if ($matched->isEmpty() && !empty($menu->permission_prefix)) {
                $matched = $allPermissions
                    ->filter(fn ($permission) => str_contains((string) $permission->name, (string) $menu->permission_prefix))
                    ->map(fn ($permission) => ['id' => $permission->id, 'name' => $permission->name])
                    ->values();
            }

            if ($matched->isEmpty() && !empty($menu->required_permission)) {
                $requiredPermission = $allPermissions->firstWhere('name', $menu->required_permission);
                $matched = collect([[
                    'id' => $requiredPermission?->id,
                    'name' => $menu->required_permission,
                ]]);
            }

            $actionPermissions = [];
            foreach ($matched as $permission) {
                $permissionName = (string) ($permission['name'] ?? '');
                $permissionId = $permission['id'] ?? null;
                $parts = explode(' ', $permissionName, 2);
                $action = strtolower((string) ($parts[0] ?? ''));
                if (!array_key_exists($action, $actionPermissions)) {
                    $actionPermissions[$action] = [
                        'id' => $permissionId,
                        'name' => $permissionName,
                    ];
                }
            }

            // Prioritaskan required_permission menu sebagai kontrol akses "view menu"
            // agar setiap menu bisa dikonfigurasi independen pada Role Manager.
            if (!empty($menu->required_permission)) {
                $requiredPermission = $allPermissions->firstWhere('name', $menu->required_permission);
                $actionPermissions['view'] = [
                    'id' => $requiredPermission?->id,
                    'name' => $menu->required_permission,
                ];
                if (!$matched->contains(fn ($permission) => ($permission['name'] ?? null) === $menu->required_permission)) {
                    $matched->push([
                        'id' => $requiredPermission?->id,
                        'name' => $menu->required_permission,
                    ]);
                }
            }

            return [
                'id' => $menu->id,
                'menu_key' => $menu->menu_key,
                'label' => $menu->label,
                'parent_id' => $menu->parent_id,
                'route' => $menu->route,
                'permissions' => $matched->values(),
                'action_permissions' => $actionPermissions,
                'actions' => $actions,
            ];
        })->values();

        return response()->json(['data' => $matrix]);
    }

    public function updateRole(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return response()->json([
            'message' => 'Role permissions updated.',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->fresh()->permissions->map(fn ($permission) => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                ])->values(),
            ],
        ]);
    }

    public function userAccess(User $user): JsonResponse
    {
        $accessMode = $this->resolveAccessMode($user);
        $permissions = $accessMode === 'custom'
            ? $user->getDirectPermissions()->pluck('name')->values()
            : $user->getAllPermissions()->pluck('name')->values();

        return response()->json([
            'data' => [
                'user_id' => $user->id,
                'access_mode' => $accessMode,
                'permissions' => $permissions,
            ],
        ]);
    }

    public function updateUserAccessMode(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'access_mode' => 'required|in:role,custom',
        ]);

        DB::table('user_access_modes')->updateOrInsert(
            ['user_id' => $user->id],
            [
                'access_mode' => $validated['access_mode'],
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );

        return response()->json(['message' => 'User access mode updated.']);
    }

    public function updateUserPermissions(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $user->syncPermissions($validated['permissions'] ?? []);

        return response()->json([
            'message' => 'User custom permissions updated.',
            'data' => [
                'permissions' => $user->fresh()->getDirectPermissions()->pluck('name')->values(),
            ],
        ]);
    }
}
