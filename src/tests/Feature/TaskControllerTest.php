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

        $response->assertSessionHas(
                'store_message', 
                "タスクが登録されました！: {$roomName}"
            );
    }

    public function test_validation_error_occurs_when_data_is_invalid()
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $invalidData = [
            'room_id' => null,
            'day_of_the_week' => 8, 
            'start_time' => 'invalid_time',
            'end_time' => '08:00', 
        ];

        $response = $this->post(route('store'), $invalidData);

        $response->assertRedirect(route('task'));

        $response->assertSessionHas('store_message', 'バリデーションエラーが発生しました。');

        $this->assertDatabaseMissing('regular_agendas', [
            'day_of_the_week' => 8,
        ]);
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
        $response->assertSessionHas('store_message', '予期しないエラーが発生しました。');
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
}
