<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\RegularAgenda;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TaskController extends Controller
{
    public function show(Request $request)
    {
        $rooms = Room::where('user_id', auth()->id())->get();
        return Inertia::render('Task',[
        'rooms' => $rooms
        ]);
    }

    public function store(Request $request)
    {
        $rooms = Room::where('user_id', auth()->id())->get();

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

        return response()->json([
            'message' => 'データが正常に登録されました！',
            'regularAgenda' => $regular_agenda,
        ], 200);


        } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'バリデーションエラーが発生しました。',
            'validationErrors' => $e->errors(),
        ], 422);
        } catch (\Exception $e) {
        return response()->json([
            'message' => '予期しないエラーが発生しました。',
            'exceptionMessage' => $e->getMessage(),
        ], 500);
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

            return Inertia::render('Task', [
                'rooms' => Room::where('user_id', auth()->id())->get(),
                'message' => '部屋を削除しました！'
            ]); 

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => '指定された部屋が見つかりませんでした。',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => '削除処理中にエラーが発生しました。',
            ], 500);
        }
    }

}
