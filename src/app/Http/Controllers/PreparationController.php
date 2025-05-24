<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\Agenda;
use App\Models\RegularAgenda;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PreparationController extends Controller
{
    public function show(Request $request)
    {
        $rooms = Room::where('user_id', auth()->id())->get();
        $regular_agendas = RegularAgenda::where('user_id', auth()->id())->get();

        return Inertia::render('Preparation',[
            'rooms' => $rooms,
            'store_message' => session('store_message'),
            'delete_message' => session('delete_message'),
            'image_url' => session('image_url'),
            'regular_agendas' => $regular_agendas,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
                'room_name' => 'required|string|min:2|max:20',
            ]);

            if (Room::where('user_id', auth()->id())->count() >= 4) {
                throw new \Exception('部屋の登録は４つまでです。');
            }

            $file = $request->file('image');
            $img_name = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('rooms', $img_name, 'private');

            $room_name = $validatedData['room_name'];

            $room = Room::create([
                'room_name' => $room_name,
                'img_name' => $img_name,
            ]);

            RegularAgenda::create([
                'room_id' => $room->id,
                'day_of_the_week' => null,
                'start_time' => null,
                'end_time' =>null,
            ]);

            $img_url = route('get.room.img', ['img_name' => $img_name]);

            return redirect()->route('preparation')->with([
                'store_message' => "'{$room_name}'が正常に登録されました！",
                'image_url' => $img_url,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->route('preparation')->with('store_message', 'バリデーションエラーが発生しました。');
        } catch (\Exception $e) {
            return redirect()->route('preparation')->with('store_message', '予期しないエラーが発生しました。');
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

            $roomName = $room->room_name;
            $room->delete();

            return redirect()->route('preparation')->with('delete_message', "'{$roomName}'を削除しました！");

        } catch (ModelNotFoundException $e) {
            return redirect()->route('preparation')->with('delete_message', '指定された部屋が見付かりませんでした。');
        } catch (\Exception $e) {
            return redirect()->route('preparation')->with('delete_message', '削除処理に失敗しました。');
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

