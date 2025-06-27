<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\Agenda;
use App\Models\RegularAgenda;
use App\Services\MicelleService;
use App\Services\PhotoService;
use App\Http\Requests\StoreImageRequest;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Aws\Exception\AwsException;

class HomeController extends Controller
{
    public function __construct(
        protected MicelleService $micelleService,
        protected PhotoService  $photoService
    ) {}

    public function show()
    {
        $rooms = Room::where('user_id', auth()->id())->get();
        $roomIds = $rooms->pluck('id')->toArray();
        $regular_agendas = RegularAgenda::whereIn('room_id', $roomIds)->get();
        $agendas = Agenda::whereIn('room_id', $roomIds)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('room_id')
            ->map(function ($group) {
                return $group->take(10);
            })->toArray();

        return Inertia::render('Home', [
            'rooms' => $rooms,  
            'agendas' => $agendas,
            'regular_agendas' => $regular_agendas,
            'updatePhoto_message' => session('updatePhoto_message'),
            'micelle_message' => session('micelle_message'),
            'score' => session('score'),
            'image_url' => session('image_url'),
            'error_message' => session('error_message')
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
    try {
        $this->micelleService->updateStatus($request, $id);
    } catch (ModelNotFoundException $e) {
        return redirect()->route('home')->with('error_message', '指定された部屋が見付かりませんでした。');
    } catch (\Exception $e) {
        Log::error($e->getMessage());
        return redirect()->route('home')->with('error_message', '予期しないエラーが発生しました。');
    }
    }

    public function updatePhoto(StoreImageRequest $request, $id)
    {
        $validatedData = $request->validated();
        $file = $validatedData['image'];
        $userId = auth()->id();

        try {
            $img_name = $this->photoService->storeRoomImage($file);

            $this->micelleService->updateRoomPhoto($userId, $id, $img_name);

            $img_url = route('get.room.img', ['img_name' => $img_name]);

            $numericValue = $this->micelleService->getAiEvaluate($file);

            $this->micelleService->updateAiEvaluate($id, $numericValue);
            
            $micelleMessage = $this->micelleService->getMicelleMessage($numericValue);

            $data = [
                'score' => $numericValue,
                'image_url' => $img_url,
                'updatePhoto_message' => 'お部屋を登録したよ！',
                'micelle_message' => $micelleMessage,
            ];

            return redirect()->route('home')->with($data);
        } catch (AwsException $e) {
            return redirect()
                ->route('home')->with('error_message', 'コスト削減の為、現在AI評価機能は利用できません。ご希望の際は製作者に連絡してください。');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return redirect()->route('home')->with('error_message', '予期しないエラーが発生しました。');
        }
    }
    
}
