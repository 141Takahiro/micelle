<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\Agenda;

class HomeController extends Controller
{
    public function show()
    {

    $rooms = Room::where('user_id', auth()->id())
        ->with(['agendas' => function ($query) {
            $query->latest('created_at')->limit(10);
        }])
        ->get();

    return Inertia::render('Home', [
        'rooms' => $rooms,  
    ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $agenda = Agenda::findOrFail($id);

        $agenda->status = 1;
        $agenda->save();
    }

}
