<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class Agenda extends Model
{
    use HasFactory;

    protected $fillable =['room_id', 'day_of_the_week', 'start_time', 'end_time', 'status', 'ai_evaluate'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
