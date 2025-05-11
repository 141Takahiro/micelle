namespace App\Services;

use App\Models\Room;
use App\Services\PhotoService;
use Illuminate\Support\Facades\Auth;

class CleaningManagerService
{
    protected $photoService;

    public function __construct(PhotoService $photoService)
    {
        $this->photoService = $photoService;
    }

    public function createDwellings(array $dwellingData)
    {
        $rooms = [];

        foreach ($dwellingData as $dwelling_data) {
            $img_name = $this->photoService->generateImgName($dwelling_data['img']);

            $roomData = [
                'room_name' => $dwelling_data['room_name'],
                'img_name' => $img_name
            ];
            
            $room = Room::create($roomData);
            $rooms[] = $room;

            if ($dwelling_data['img']) {
                $this->photoService->storeImg($dwelling_data['img'], $img_name);
            }
        }
        return $rooms;
    }

    public function showRoom()
    {
        $user_id = Auth::id();
        $stored_rooms = Room::where('user_id', $user_id)->get()->toArray();

        if ($stored_rooms->isEmpty()) {
            $stored_rooms[] = [
                    'room_id' => null,
                    'user_id' => $user_id,
                    'room_name' => '部屋はありません',
                    'img_name' => 'default-room.png'
                ];
        }       
        return $stored_rooms;
    }

    public function createRegularAgenda(array $rooms)
    {
        $regularAgenda = [];

        foreach ($rooms as $room) {
            $regularAgendas[] = RegularAgenda::create([
                'room_id' => $room->id,
                'cleaningtime' => null,    
            ]);
        }

        return $regularAgendas; 
    }

    public function deleteDwelling($room_id)
    {
        $user_id = Auth::id();

        $room = Room::where('user_id', $user_id)->where('id', $room_id)->first();
        if (!$room) {
            return false;
        }

        $room->delete();

        return true;
    }
}