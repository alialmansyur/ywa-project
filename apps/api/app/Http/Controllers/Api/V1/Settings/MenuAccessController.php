<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/**
 * @tags Settings - Menu Access
 */
class MenuAccessController extends Controller
{
    private function resolvePermissionGuard(Request $request): string
    {
        $category = strtolower((string) ($request->query('category') ?: $request->header('X-Client-Category', '')));

        return $category === 'mobile' ? 'mobile' : 'web';
    }

    private function resolveMenuPlatforms(Request $request): array
    {
        $category = strtolower((string) ($request->query('category') ?: $request->header('X-Client-Category', '')));

        if ($category === 'mobile') {
            return ['mobile'];
        }

        if ($category === 'web') {
            return ['web'];
        }

        if ($category === 'admin') {
            return ['admin'];
        }

        return ['admin', 'web'];
    }

    private function resolvePermissionNames(User $user, string $accessMode, string $guard): array
    {
        if ($accessMode === 'custom') {
            $customPermissionNames = DB::table('model_has_permissions as mhp')
                ->join('permissions as p', 'p.id', '=', 'mhp.permission_id')
                ->where('mhp.model_type', User::class)
                ->where('mhp.model_id', $user->id)
                ->where('p.guard_name', $guard)
                ->pluck('p.name')
                ->values()
                ->all();

            if (!empty($customPermissionNames)) {
                return $customPermissionNames;
            }
        }

        $roleNames = DB::table('model_has_roles as mhr')
            ->join('roles as r', 'r.id', '=', 'mhr.role_id')
            ->where('mhr.model_type', User::class)
            ->where('mhr.model_id', $user->id)
            ->pluck('r.name')
            ->filter()
            ->values()
            ->all();

        if (empty($roleNames)) {
            return [];
        }

        return Role::query()
            ->where('guard_name', $guard)
            ->whereIn('name', $roleNames)
            ->with('permissions:id,name,guard_name')
            ->get()
            ->flatMap(fn ($role) => $role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Menu sidebar berdasarkan permission user login.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $accessMode = DB::table('user_access_modes')->where('user_id', $user->id)->value('access_mode') ?? 'role';
        $guard = $this->resolvePermissionGuard($request);
        $permissionNames = collect($this->resolvePermissionNames($user, $accessMode, $guard))->flip();
        $platforms = $this->resolveMenuPlatforms($request);

        $menus = DB::table('app_menus')
            ->where('is_active', true)
            ->whereIn('platform', $platforms)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $allowed = $menus->filter(function ($menu) use ($permissionNames) {
            if (empty($menu->required_permission)) return true;
            return $permissionNames->has($menu->required_permission);
        })->values();

        $allowedById = $allowed->keyBy('id');
        $menuById = $menus->keyBy('id');
        foreach ($allowed as $item) {
            $parentId = $item->parent_id;
            while ($parentId) {
                if ($allowedById->has($parentId)) {
                    break;
                }
                $parent = $menuById->get($parentId);
                if (!$parent) {
                    break;
                }
                $allowedById->put($parentId, $parent);
                $parentId = $parent->parent_id;
            }
        }

        $grouped = $allowedById->values()->groupBy('parent_id');

        $buildTree = function ($parentId) use (&$buildTree, $grouped) {
            return ($grouped[$parentId] ?? collect())->map(function ($item) use ($buildTree) {
                return [
                    'id' => $item->id,
                    'menu_key' => $item->menu_key,
                    'label' => $item->label,
                    'route' => $item->route,
                    'icon' => $item->icon,
                    'children' => $buildTree($item->id)->values(),
                ];
            })->values();
        };

        return response()->json([
            'data' => $buildTree(null),
        ]);
    }
}
