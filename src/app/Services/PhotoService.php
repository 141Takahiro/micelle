namespace App\Services;

use Illuminate\Support\Facades\Storage;


class PhotoService
{
    public function generateImgName($img)
    {
        if (!$img) {
            return 'default-room.png';
        }
        
        $extension = $img->guessExtension() ?? 'jpg';
        return uniqid('img_', true) . '.' .  $extension;
    }

    
    public function storeImage($img, $img_name)
    {
        $img->storeAs('room_imgs', $img_name, 'public');
    }
}