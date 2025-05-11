<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;

class Room extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'room_name', 'img_name'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($room) {
            $room->user_id = Auth::id();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function regularAgenda()
    {
        return $this->hasOne(RegularAgenda::class, 'room_id');
    }
}
