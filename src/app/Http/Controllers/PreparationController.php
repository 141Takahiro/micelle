<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PreparationController extends Controller
{
    public function show()
    {
        return Inertia::render('Preparation');
    }

    public function store(Request $request)
    {
        if ($request->hasFile('image')) {
            $file = $request->file('image');

            $path = $file->store('rooms', 'private');

            return Inertia::render('Preparation', [
                'message' => '画像が正常にアップロードされました。',
            ]);
        }

        return Inertia::render('Preparation', [
            'message' => '送信に失敗しました。',
        ]);
    }
}
