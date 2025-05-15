<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PreparationController extends Controller
{
    public function show(Request $request)
    {
        $rooms = Room::where('user_id', auth()->id())->get();
        return Inertia::render('Preparation',[
            'rooms' => $rooms
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
                'room_name' => 'required|string|min:3|max:20',
            ]);

            if (Room::where('user_id', auth()->id())->count() >= 4) {
                throw new \Exception('部屋の登録は４つまでです。');
            }

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
                'rooms' => Room::where('user_id', auth()->id())->get(),
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
                'errors' => ['message' => $e->getMessage()],
            ]);
        }

    }

    public function delete($id) 
    {
        try {
            $room = Room::where('user_id', auth()->id())->findOrFail($id);

            $filePath = storage_path("app/private/rooms/{$room->img_name}");

            if (file_exists($filePath)) { 
                unlink($filePath);
            }

            $room->delete();

            return Inertia::render('Preparation', [
                'rooms' => Room::where('user_id', auth()->id())->get(),
                'message' => '部屋を削除しました！'
            ]); 

        } catch (ModelNotFoundException $e) {
            return Inertia::render('Preparation', [
                'rooms' => Room::where('user_id', auth()->id())->get(),
                'error' => '指定された部屋が見つかりませんでした。'
            ]); 
        } catch (Exception $e) {
            return Inertia::render('Preparation', [
                'rooms' => Room::where('user_id', auth()->id())->get(),
                'error' => '削除処理中にエラーが発生しました。'
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

