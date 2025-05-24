<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AgendaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agendas = [];
        for ($i = 1; $i <= 100; $i++) { 
            $startTime = now()->addHours(rand(8, 18));
            $endTime = $startTime->addHours(rand(1, 5)); 
           
            $agendas[] = [
                'user_id' => 1,
                'room_id' => rand(1, 4),
                'day_of_the_week' => rand(1, 7), 
                'start_time' => $startTime->format('H:i'),
                'end_time' => $endTime->format('H:i'),
                'status' => (bool)rand(0, 1),
                'ai_evaluate' => rand(50, 100), 
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('agendas')->insert($agendas);
    }
}
