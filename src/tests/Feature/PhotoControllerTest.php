<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Services\PhotoService;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Mockery;

class PhotoControllerTest extends TestCase
{

    use RefreshDatabase;

    public function test_it_returns_image_when_file_exists()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Storage::fake('private');

        Storage::disk('private')->put('rooms/room123.png', 'dummy-binary-data');

        $response = $this->get(route('get.room.img', ['img_name' => 'room123.png']));

        $response->assertStatus(200);
        $this->assertSame('dummy-binary-data', $response->getContent());
    }

    public function test_it_redirects_with_error_message_when_file_not_found()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Storage::fake('private');

        $response = $this->get(route('get.room.img', ['img_name' => 'no-such.png']));

        $response
            ->assertRedirect(route('home'))
            ->assertSessionHas('error_message', '画像が見つかりません');
    }

    public function test_it_redirects_with_generic_error_message_on_unexpected_exception()
    {
        $this->instance(
            PhotoService::class,
            Mockery::mock(PhotoService::class, function ($m) {
                $m->shouldReceive('getRoomImageResponse')
                  ->andThrow(new \Exception('something went wrong'));
            })
        );

        $response = $this->get(route('get.room.img', ['img_name' => 'anything.png']));

        $response
            ->assertRedirect(route('home'))
            ->assertSessionHas('error_message', '予期しないエラーが発生しました。');
    }
}
