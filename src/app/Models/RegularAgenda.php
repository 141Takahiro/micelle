<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;

class RegularAgenda extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'room_id', 'cleaning_time'];

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
