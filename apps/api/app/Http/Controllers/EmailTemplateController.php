<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    public function index(Request $request)
    {
        $templates = EmailTemplate::query()
            ->when($request->filled('code'), fn ($q) => $q->where('code', $request->string('code')))
            ->orderBy('id')
            ->paginate($request->integer('per_page', 20));

        return response()->json($templates);
    }

    public function show($id)
    {
        $template = EmailTemplate::findOrFail($id);
        return response()->json(['data' => $template]);
    }

    public function update(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'subject' => 'required|string|max:200',
            'body_html' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return response()->json([
            'message' => 'Email Template berhasil diperbarui.',
            'data' => $template,
        ]);
    }
}
