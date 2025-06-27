<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Room;
use App\Models\RegularAgenda;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;
use App\Services\MicelleService;
use App\Http\Requests\StoreRegularAgendaRequest;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    private MicelleService $micelleService;

    public function __construct(MicelleService $micelleService)
    {
        $this->micelleService = $micelleService;
    }

    public function show()
    {
        $rooms = Room::where('user_id', auth()->id())->get();
        $roomIds = $rooms->pluck('id')->toArray();
        $regular_agendas = RegularAgenda::whereIn('room_id', $roomIds)
                                    ->get();

        return Inertia::render('Task',[
            'store_message' => session('store_message'),
            'delete_message' => session('delete_message'),
            'rooms' => $rooms,
            'regular_agendas' => $regular_agendas,
            'error_message' => session('error_message')
        ]);
    }

    public function store(StoreRegularAgendaRequest $request)
    {
        $data = $request->validated();

        try {
            $roomName = $this->micelleService->updateRegularAgenda($data);
            return redirect()->route('task')->with('store_message', "タスクが登録されました！: {$roomName}");

        } catch (ModelNotFoundException $e) {
            return redirect()->route('task')->with('error_message', '指定された部屋が見付かりませんでした。');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return redirect()
                ->route('task')->with('error_message', '予期しないエラーが発生しました。');
        }
    }

    public function delete(int $id)
    {
        try {
            $roomName = $this->micelleService->deleteRoom($id, auth()->id());

            return redirect()->route('task')->with('delete_message', "'{$roomName}'を削除しました！");

        } catch (ModelNotFoundException $e) {
            return redirect()->route('task')->with('error_message', '指定された部屋が見付かりませんでした。');

        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return redirect()->route('task')->with('error_message', '予期しないエラーが発生しました。');
        }
    }
}
