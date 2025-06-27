<?php

namespace App\Http\Controllers;

use App\Http\Requests\PreparationRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\RegularAgenda;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Services\MicelleService;
use App\Services\PhotoService;
use Illuminate\Support\Facades\Log;

class PreparationController extends Controller
{
    public function __construct(
        protected MicelleService $micelleService,
        protected PhotoService  $photoService
    ) {}

    public function show()
    {
        $rooms = Room::where('user_id', auth()->id())->get();
        $roomIds = $rooms->pluck('id')->toArray();
        $regular_agendas = RegularAgenda::whereIn('room_id', $roomIds)
                                    ->get();

        return Inertia::render('Preparation',[
            'rooms' => $rooms,
            'store_message' => session('store_message'),
            'delete_message' => session('delete_message'),
            'image_url' => session('image_url'),
            'regular_agendas' => $regular_agendas,
            'error_message' => session('error_message')
        ]);
    }

    public function store(PreparationRequest $request)
    {
        $validatedData = $request->validated();
        $file = $validatedData['image'];
        $roomName = $validatedData['room_name'];
        $userId = auth()->id();

        try {
            $img_name = $this->photoService->storeRoomImage($file);
            $this->micelleService->createRoom($roomName, $img_name, $userId);
            $img_url = route('get.room.img', ['img_name' => $img_name]);

            return redirect()->route('preparation')->with([
                'store_message' => "'{$roomName}'が正常に登録されました！",
                'image_url'     => $img_url,
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return redirect()->route('preparation')->with('error_message', '予期しないエラーが発生しました。');
        }
    }

    public function delete($id) 
    {
        try {
            $roomName = $this->micelleService->deleteRoom($id, auth()->id());

            return redirect()->route('preparation')->with('delete_message', "'{$roomName}'を削除しました！");

        } catch (ModelNotFoundException $e) {
            return redirect()->route('preparation')->with('error_message', '指定された部屋が見付かりませんでした。');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return redirect()->route('preparation')->with('error_message', '予期しないエラーが発生しました。');
        }
    }
}

