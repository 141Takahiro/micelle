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
        $request->validate([
        'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);
        
        try {
            $file = $request->file('image');
            $img_name = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('rooms', $img_name, 'private');

            return Inertia::render('Preparation', [
                'message' => '画像が正常にアップロードされました。',
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Preparation', [
                'message' => '送信に失敗しました。',
                'error' => $e->getMessage(),
            ]);
        }
    }
}

