<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;

class PreparationController extends Controller
{
    public function show()
    {
        return Inertia::render('Preparation');
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
                'room_name' => 'required|string|min:3|max:20',
            ]);

            $file = $request->file('image');
            $img_name = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('rooms', $img_name, 'private');

            $room_name = $validatedData['room_name'];

            Room::create([
                'room_name' => $room_name,
                'img_name' => $img_name,
            ]);

            return Inertia::render('Preparation', [
                'message' => '画像が正常にアップロードされました。',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Inertia::render('Preparation', [
                'errors' => $e->errors(),
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Preparation', [
                'errors' => ['message' => '送信に失敗しました。'],
            ]);
        }

    }
}

