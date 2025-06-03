<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Room;
use App\Models\User;


class RoomFactory extends Factory
{
    protected $model = Room::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create()->id,
            'room_name' => $this->faker->words(2, true), 
            'img_name' => $this->faker->optional()->word(), 
            'created_at' => now(),
            'updated_at' => now(),
        ];

    }
}
