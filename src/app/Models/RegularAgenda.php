<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;

class RegularAgenda extends Model
{
    use HasFactory;

    protected $fillable = ['room_id', 'day_of_the_week', 'start_time', 'end_time'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($regular_agenda) {
                $regular_agenda->user_id = Auth::id();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
