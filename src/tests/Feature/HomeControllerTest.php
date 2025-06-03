<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;
use App\Models\Room;
use App\Models\Agenda;
use Illuminate\Database\Eloquent\Factories\Factory;
use Inertia\Testing\AssertableInertia as Inertia;



class HomeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_show_method_returns_correct_data(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Room::factory()->count(2)->create(['user_id' => $user->id]);

        $this->get('/home')->assertInertia(fn (Inertia $page) =>
                    $page->component('Home')
                        ->has('rooms', 2)
                        ->where('rooms.0.user_id', $user->id)
                        ->where('rooms.1.user_id', $user->id)
             );
    }

    public function test_show_method_returns_correct_data_with_no_rooms(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get('/home');

        $response->assertInertia(fn ($page) =>
            $page->component('Home')
                ->where('rooms', [])
        );
    }

    public function test_update_status_changes_agenda()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $room = Room::factory()->create([
            'user_id' => $user->id
        ]);

        $agenda = Agenda::factory()->create([
            'status' => 0,
            'room_id' => $room->id
        ]);

        $this->put('/agendas/' . $agenda->id . '/update-status', ['status' => 1]);

        $this->assertDatabaseHas('agendas', [
            'id' => $agenda->id,
            'status' => 1 
        ]);

        $this->assertDatabaseMissing('agendas', [
            'id' => $agenda->id,
            'status' => 0
        ]);
    }

    public function test_update_photo_updates_room_image()
    {
        Storage::fake('private');

        $user = User::factory()->create();
        $this->actingAs($user);

        $room = Room::factory()->create([
            'user_id' => $user->id
        ]);

        $file = UploadedFile::fake()->image('test.jpg');

        $response = $this->post('/updatePhoto/' . $room->id, [
            'image' => $file
        ]);

        $room->refresh();

        $this->assertNotNull($room->img_name);
        Storage::disk('private')->assertExists('rooms/' . $room->img_name);
    }

    public function test_get_room_image_returns_file()
    {
        Storage::fake('private');

        $fileName = 'test-image.jpg';
        Storage::disk('private')->put("rooms/{$fileName}", 'dummy content');

        $response = $this->get(route('home.room.img', ['img_name' => $fileName]));

        $response->assertStatus(200)
                ->assertHeader('Content-Type', 'image/jpeg')
                ->assertHeader('Content-Disposition', 'inline; filename="' . $fileName . '"');
    }

    public function test_get_room_image_redirects_when_file_not_found()
    {
        Storage::fake('private');

        $response = $this->get(route('home.room.img', ['img_name' => 'nonexistent.jpg']));

        $response->assertRedirect(route('home'));

        $response->assertSessionHas('updatePhoto_message', '画像が見つかりません');
    }

}
