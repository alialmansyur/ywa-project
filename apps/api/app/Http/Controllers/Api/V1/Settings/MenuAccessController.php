<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @tags Settings - Menu Access
 */
class MenuAccessController extends Controller
{
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

    /**
     * Menu sidebar berdasarkan permission user login.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $accessMode = DB::table('user_access_modes')->where('user_id', $user->id)->value('access_mode') ?? 'role';
        $customPermissions = $user->getDirectPermissions()->pluck('name')->flip();
        $platforms = $this->resolveMenuPlatforms($request);

        $menus = DB::table('app_menus')
            ->where('is_active', true)
            ->whereIn('platform', $platforms)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $allowed = $menus->filter(function ($menu) use ($user, $accessMode, $customPermissions) {
            if (empty($menu->required_permission)) return true;
            if ($accessMode === 'custom') {
                // Fallback ke role permission jika user belum punya direct permission apa pun.
                if ($customPermissions->isEmpty()) {
                    try {
                        return $user->hasPermissionTo($menu->required_permission);
                    } catch (\Throwable) {
                        return false;
                    }
                }
                return $customPermissions->has($menu->required_permission);
            }
            try {
                return $user->hasPermissionTo($menu->required_permission);
            } catch (\Throwable) {
                return false;
            }
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
