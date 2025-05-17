<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\RegularAgenda;

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
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
            ]);

                $regular_agenda = RegularAgenda::where('room_id', $validatedData['room_id'])->first();

                if (!$regular_agenda) {
                    return Inertia::render('Task', [
                        'error' => '指定された RegularAgenda が存在しません。',
                        'rooms' => $rooms,
                    ]);
                }

    $regular_agenda->update($validatedData);
    $regular_agenda->refresh();
           
            return Inertia::render('Task', [
                'success' => 'データが正常に登録されました！',
                'regularAgenda' => $regular_agenda,
                'rooms' => $rooms,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Inertia::render('Task', [
                'error' => 'バリデーションエラーが発生しました。',
                'validationErrors' => $e->errors(),
                'rooms' => $rooms,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Task', [
                'error' => '予期しないエラーが発生しました。',
                'exceptionMessage' => $e->getMessage(),
                'rooms' => $rooms,
            ]);
        }
    }


}
