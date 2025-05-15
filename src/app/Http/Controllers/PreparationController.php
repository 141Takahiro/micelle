<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
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
            $file->storeAs('rooms', $img_name, 'private');

            $room_name = $validatedData['room_name'];

            Room::create([
                'room_name' => $room_name,
                'img_name' => $img_name,
            ]);

            $img_url = route('get.room.img', ['img_name' => $img_name]);

            return Inertia::render('Preparation', [
                'message' => '画像が正常にアップロードされました。',
                'room_name' => $room_name,
                'image_url' => $img_url,
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

    public function getRoomImage($img_name)
    {
        $path = "rooms/{$img_name}";
        
        if (!Storage::disk('private')->exists($path)) {
            abort(404, '画像が見つかりません');
        }

        return Response::make(Storage::disk('private')->get($path), 200, [
            'Content-Type' => Storage::disk('private')->mimeType($path),
            'Content-Disposition' => 'inline; filename="' . $img_name . '"'
        ]);
    }
}

