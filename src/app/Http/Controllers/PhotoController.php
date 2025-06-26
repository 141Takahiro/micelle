<?php

namespace App\Http\Controllers;

use App\Services\PhotoService;
use Illuminate\Support\Facades\Log;


class PhotoController extends Controller
{
    public function __construct(
        protected PhotoService  $photoService
    ) {}

    public function getRoomImage(string $img_name)
    {
        try {
            return $this->photoService->getRoomImageResponse($img_name);
        }
        catch (\Exception $e) {
            Log::error($e->getMessage());

            return redirect()
                ->route('home')
                ->with('error_message', '予期しないエラーが発生しました。');
        }
    }
}

