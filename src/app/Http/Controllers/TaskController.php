<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\RegularAgenda;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    public function show(Request $request)
    {
        $rooms = Room::where('user_id', auth()->id())->get();
        $regular_agendas = RegularAgenda::where('user_id', auth()->id())->get();

        return Inertia::render('Task',[
            'store_message' => session('store_message'),
            'delete_message' => session('delete_message'),
            'rooms' => $rooms,
            'regular_agendas' => $regular_agendas,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'room_id' => 'required|integer|exists:rooms,id',
                'day_of_the_week' => 'required|integer|between:1,7',
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => [
                    'nullable',
                    'date_format:H:i',
                    function ($attribute, $value, $fail) use ($request) {
                        if (!empty($request->start_time) && !empty($value) && $value <= $request->start_time) {
                            $fail('終了時間は開始時間より後である必要があります。');
                        }
                    }
                ],
            ]);

            $regular_agenda = RegularAgenda::where('room_id', $validatedData['room_id'])->first();

            if (!$regular_agenda) {
                throw new \Exception('RegularAgenda が見つかりません。');
            }

            $regular_agenda->update($validatedData);
            $regular_agenda->refresh();

            $room = Room::find($validatedData['room_id']);
            $roomName = $room->room_name;

            if (!$room) {
                throw new \Exception('指定された Room が見つかりません。');
            }


            return redirect()->route('task')->with(
                'store_message', 
                "データが正常に登録されました！ 部屋名: {$roomName}"

            );


        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->route('task')->with('store_message', 'バリデーションエラーが発生しました。');
        } catch (\Exception $e) {
            return redirect()->route('task')->with('store_message', '予期しないエラーが発生しました。');
        }
    }

        public function delete($id) 
    {
        try {
            $room = Room::where('user_id', auth()->id())->findOrFail($id);

            $filePath = storage_path("app/private/rooms/{$room->img_name}");

            if (Storage::disk('private')->exists("rooms/{$room->img_name}")) {
                Storage::disk('private')->delete("rooms/{$room->img_name}");
            }

            $roomName = $room->room_name;
            $room->delete();

            return redirect()->route('task')->with('delete_message', "'{$roomName}'を削除しました！");

        } catch (ModelNotFoundException $e) {
            return redirect()->route('task')->with('delete_message', '指定された部屋が見付かりませんでした。');
        } catch (\Exception $e) {
            return redirect()->route('task')->with('delete_message', '削除処理に失敗しました。');
        }
    }

}
