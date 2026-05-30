<?php

namespace App\Http\Controllers\Api\V1\Asset;

use App\Http\Controllers\Controller;
use App\Models\GuideChapter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuideController extends Controller
{
    public function index(): JsonResponse
    {
        $sections = GuideChapter::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'title', 'summary', 'body', 'sort_order']);

        return response()->json([
            'title' => 'Buku Panduan Operasional',
            'subtitle' => 'Panduan operasional detail berbasis proses workshop, preventive, dan inspeksi lapangan.',
            'sections' => $sections,
        ]);
    }

    public function chapters(Request $request): JsonResponse
    {
        $query = GuideChapter::query()->orderBy('sort_order')->orderBy('id');

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return response()->json($query->paginate($request->integer('per_page', 20)));
    }

    public function storeChapter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $chapter = GuideChapter::create([
            'title' => $validated['title'],
            'summary' => $validated['summary'] ?? null,
            'body' => $validated['body'],
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Chapter panduan berhasil dibuat.',
            'data' => $chapter,
        ], 201);
    }

    public function showChapter(GuideChapter $chapter): JsonResponse
    {
        return response()->json($chapter);
    }

    public function updateChapter(Request $request, GuideChapter $chapter): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'summary' => ['nullable', 'string', 'max:500'],
            'body' => ['sometimes', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $chapter->update($validated);

        return response()->json([
            'message' => 'Chapter panduan berhasil diperbarui.',
            'data' => $chapter->fresh(),
        ]);
    }

    public function destroyChapter(GuideChapter $chapter): JsonResponse
    {
        $chapter->delete();

        return response()->json(['message' => 'Chapter panduan berhasil dihapus.']);
    }
}
