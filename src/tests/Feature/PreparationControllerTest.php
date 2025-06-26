<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;
use App\Models\Room;
use App\Models\RegularAgenda;
use Inertia\Testing\AssertableInertia;


class PreparationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_access_show_method()
    {
        $user = User::factory()->create();
        $this->actingAs($user); 

        $room = Room::factory()->create(); 

        $regularAgenda = RegularAgenda::factory()->create([
            'room_id' => $room->id
        ]);

        $response = $this->get(route('preparation'));

        $response->assertInertia(function (AssertableInertia $page) {
        $page->component('Preparation')
            ->has('rooms')
            ->has('regular_agendas')
            ->where('store_message', null)
            ->where('delete_message', null)
            ->where('image_url', null);
    });

    }


    public function test_it_stores_a_room_successfully()
{
    Storage::fake('private'); 

    $user = User::factory()->create();
    $this->actingAs($user);

    $file = UploadedFile::fake()->image('test_image.jpg');

    $response = $this->post(route('upload'), [
        'image' => $file,
        'room_name' => 'テストルーム'
    ]);

    $response->assertRedirect(route('preparation'));
    $response->assertSessionHas('store_message', "'テストルーム'が正常に登録されました！");

    $this->assertDatabaseHas('rooms', [
        'room_name' => 'テストルーム'
    ]);

    $room = Room::where('room_name', 'テストルーム')->first();
    $this->assertDatabaseHas('regular_agendas', [
        'room_id' => $room->id
    ]);

    $img_name = $room->img_name; 

    Storage::disk('private')->assertExists("rooms/{$img_name}");
}
    
    public function test_it_fails_if_user_has_four_rooms()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Room::factory()->count(4)->create(['user_id' => $user->id]);

        $file = UploadedFile::fake()->image('test_image.jpg');

        $response = $this->post(route('upload'), [
            'image' => $file,
            'room_name' => '新しい部屋'
        ]);

        $response->assertSessionHas('error_message', fn ($message) =>
            str_contains($message, '予期しないエラーが発生しました。') 
        );
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

        $response = $this->delete(route('preparation.delete', ['id' => $room->id]));

        $response->assertRedirect(route('preparation'));

        $response->assertSessionHas('delete_message', "'{$room->room_name}'を削除しました！");

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);

        Storage::disk('private')->assertMissing("rooms/{$room->img_name}");
    }

    public function test_delete_returns_error_message_if_room_not_found()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $nonExistentId = 9999;

        $response = $this->delete(route('preparation.delete', ['id' => $nonExistentId]));

        $response->assertRedirect(route('preparation'));

        $response->assertSessionHas(
            'error_message',
            '指定された部屋が見付かりませんでした。'
        );
    }

}

