<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;


Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    $regularAgendas = DB::table('regular_agendas')->get();

    $agendas = [];

    foreach ($regularAgendas as $regularAgenda) {
            $agendas[] = [
                'user_id' => $regularAgenda->user_id,
                'room_id' => $regularAgenda->room_id,
                'day_of_the_week' => $regularAgenda->day_of_the_week,
                'start_time' => $regularAgenda->start_time,
                'end_time' => $regularAgenda->end_time,
                'status' => 0, 
                'ai_evaluate' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
    }
    DB::table('agendas')->insert($agendas);

    info('`agendas` を `regular_agendas` から自動生成しました。');
// })->weeklyOn(0, '00:00');
})->everyMinute(); //テスト用
