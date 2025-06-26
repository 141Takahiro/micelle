<?php
namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Redirect;


class PhotoService
{
    public function storeRoomImage(UploadedFile $file): string
    {
        $img_name = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('rooms', $img_name, 'private');

        return $img_name;
    }

    public function getRoomImageResponse(string $img_name)
    {
        $path = "rooms/{$img_name}";

        if (!Storage::disk('private')->exists($path)) {
            return Redirect::route('home')->with('error_message', '画像が見つかりません');
        }

        $contents = Storage::disk('private')->get($path);
        $mimeType = Storage::disk('private')->mimeType($path);

        return Response::make($contents, 200, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $img_name . '"'
        ]);
    }
}