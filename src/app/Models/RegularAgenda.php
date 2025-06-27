<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Agenda;

class RegularAgenda extends Model
{
    use HasFactory;

    protected $fillable = ['room_id', 'day_of_the_week', 'start_time', 'end_time'];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($regular_agenda) {               
            Agenda::create([
                'room_id' => $regular_agenda->room_id,
                'day_of_the_week' => $regular_agenda->day_of_the_week,
                'start_time' => $regular_agenda->start_time,
                'end_time' => $regular_agenda->end_time,
                'status' => false,
                'ai_evaluate' => null,
            ]);
        });

        static::updated(function ($regular_agenda) {
            $latestAgenda = Agenda::where('room_id', $regular_agenda->room_id)
                ->latest('created_at') 
                ->first();

        if ($latestAgenda) {
            $latestAgenda->update([
                'day_of_the_week' => $regular_agenda->day_of_the_week,
                'start_time' => $regular_agenda->start_time,
                'end_time' => $regular_agenda->end_time,
            ]);
        }
        });

    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
