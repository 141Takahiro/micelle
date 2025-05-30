<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;


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
                'room_id' => rand(6, 9),
                'day_of_the_week' => rand(1, 7), 
                'start_time' => $startTime->format('H:i'),
                'end_time' => $endTime->format('H:i'),
                'status' => (bool)rand(0, 1),
                'ai_evaluate' => rand(50, 100), 
                'created_at' => Carbon::now()->subDays(rand(0, 30)),
                'updated_at' => Carbon::now(),
            ];
        }

        DB::table('agendas')->insert($agendas);
    }
}
