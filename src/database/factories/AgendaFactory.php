<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Agenda;
use App\Models\Room;
use Carbon\Carbon;



class AgendaFactory extends Factory
{
    public function definition(): array
    {
         return [
            'room_id' => Room::factory(), 
            'day_of_the_week' => $this->faker->numberBetween(1, 7), 
            'start_time' => Carbon::createFromTime($this->faker->numberBetween(8, 18), $this->faker->randomElement([0, 30]))->format('H:i'), 
            'end_time' => Carbon::createFromTime($this->faker->numberBetween(9, 20), $this->faker->randomElement([0, 30]))->format('H:i'), 
            'status' => $this->faker->boolean(),
            'ai_evaluate' => $this->faker->optional()->numberBetween(1, 100),
            'created_at' => now(),
            'updated_at' => now(),
        ];


    }
}
