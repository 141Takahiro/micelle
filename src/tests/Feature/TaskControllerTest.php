<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Room;
use App\Models\RegularAgenda;
use Inertia\Testing\AssertableInertia;
use Illuminate\Support\Facades\Storage;

class TaskControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_task_page()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $room = Room::factory()->create(['user_id' => auth()->id()]);

        $regular_agenda = RegularAgenda::factory()->create([
            'room_id' => $room->id,
            'day_of_the_week' => 'Monday', 
            'start_time' => '09:00',
            'end_time' => '10:00',
            'user_id' => auth()->id(),
        ]);

        $response = $this->get('/task');

        $response->assertInertia(fn ($page) => 
            $page->component('Task') 
                ->has('rooms', 1) 
                ->has('regular_agendas', 1) 
        );
    }

    public function test_authenticated_user_can_store_regular_agenda_successfully()
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $room = Room::factory()->create(['user_id' => auth()->id()]);

        $regular_agenda = RegularAgenda::factory()->create([
            'room_id' => $room->id,
            'day_of_the_week' => 1,
            'start_time' => '09:00',
            'end_time' => '10:00',
            'user_id' => auth()->id(),
        ]);

    
        $requestData = [
            'room_id' => $room->id,
            'day_of_the_week' => 2,
            'start_time' => '11:00',
            'end_time' => '12:00',
        ];

        $response = $this->post(route('store'), $requestData);

        $response->assertRedirect(route('task'));

        $this->assertDatabaseHas('regular_agendas', [
            'room_id' => $room->id,
            'day_of_the_week' => 2,
            'start_time' => '11:00',
            'end_time' => '12:00',
            'user_id' => auth()->id(),
        ]);

        $roomName = 'サンプルルーム';  
        return redirect()->route('task')->with(
            'store_message', 
            "タスクが登録されました！: {$roomName}"
        );
    }

    public function test_exception_occurs_when_regular_agenda_not_found()
    {

        $user = User::factory()->create();

        $this->actingAs($user);

        $room = Room::factory()->create(['user_id' => auth()->id()]);

        $requestData = [
            'room_id' => $room->id,
            'day_of_the_week' => 3,
            'start_time' => '13:00',
            'end_time' => '14:00',
        ];

        $response = $this->post(route('store'), $requestData);

        $response->assertRedirect(route('task'));
        $response->assertSessionHas('error_message', '指定された部屋が見付かりませんでした。');
    }

    public function test_it_deletes_a_room_successfully()
    {
        Storage::fake('private'); 

        $user = User::factory()->create();
        $this->actingAs($user);

        $room = Room::factory()->create([
            'img_name' => 'test_image.jpg' 
        ]);

        Storage::disk('private')->put("rooms/{$room->img_name}", 'dummy content');

        $response = $this->delete(route('task.delete', ['id' => $room->id]));

        $response->assertRedirect(route('task'));

        $response->assertSessionHas('delete_message', "'{$room->room_name}'を削除しました！");

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);

        Storage::disk('private')->assertMissing("rooms/{$room->img_name}");
    }

    public function test_delete_returns_error_message_if_room_not_found()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $nonExistentId = 9999;

        $response = $this->delete(route('task.delete', ['id' => $nonExistentId]));

        $response->assertRedirect(route('task'));

        $response->assertSessionHas(
            'error_message',
            '指定された部屋が見付かりませんでした。'
        );
    }
}
