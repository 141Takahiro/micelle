<?php

namespace App\Http\Controllers;

use App\Services\CleaningManagerService;
use App\Models\RegularAgenda;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PreparationController2 extends Controller
{
    protected $cleaningManagerService;

    public function __construct(CleaningManagerService $cleaningManagerService)
    {
        $this->cleaningManagerService = $cleaningManagerService;
    }

    public function show()
    {
        //$stored_rooms = $this->cleaningManagerService->showRoom();
    
        return Inertia::render('Preparation', [
            //'stored_rooms' => $stored_rooms
        ]);
    }


    public function store(Request $request)
    {
        $roomNames = $request->input('room_name');
        $imgs = $request->file('img');

        if (!is_array($roomNames) || empty($roomNames)) { 
            return response()->json([
                'message' => '部屋の名前は必須です。'
            ], 400);
        }
    
        $dwellingData = [];
    
        foreach ($roomNames as $index => $roomName) {
            $img = isset($imgs[$index]) ? $imgs[$index] : null;

            if ($img === "null") {
                $img = null;
            }        
    
            $dwellingData[] = [
                'room_name' => $roomName,
                'img' => $img,
            ];
        }

        try {
            $rooms = $this->cleaningManagerService->createDwellings($dwellingData);
            if (!$rooms) {
                throw new \Exception('部屋の作成に失敗しました。');
            }
        
            $regularAgendas = $this->cleaningManagerService->createRegularAgenda($rooms);
            if (!$regularAgendas) {
                throw new \Exception('初期登録に失敗しました。');
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }

        $user_id = Auth::id(); 
        $allRegularAgendas = RegularAgenda::where('user_id', $user_id)->get();
        
        return Inertia::render('Task', [
            'regularAgendas' => $allRegularAgendas
        ]);
    }

    

    public function delete($room_id)
    {
        if ($this->cleaningManagerService->deleteDwelling($room_id)) {
            return response()->json(['message' => '部屋と関連データを削除しました']);
        }

        return response()->json(['message' => '対象の部屋が見つかりません'], 404);
    }
}
