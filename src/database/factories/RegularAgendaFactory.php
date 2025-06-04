<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Room;
use App\Models\User;


class RegularAgendaFactory extends Factory
{
    public function definition(): array
    {
    return [
        'room_id' => Room::factory(), 
        'user_id' => User::factory(), 
        'day_of_the_week' => $this->faker->randomElement([null, 'Monday', 'Tuesday', 'Wednesday']),
        'start_time' => $this->faker->time('H:i:s'), 
        'end_time' => $this->faker->time('H:i:s'), 
    ];


    }
}
