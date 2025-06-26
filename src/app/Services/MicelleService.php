<?php
namespace App\Services;

use App\Models\RegularAgenda;
use App\Models\Agenda;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Aws\Rekognition\RekognitionClient;
use Aws\Exception\AwsException;



class MicelleService
{
    public function updateRegularAgenda(array $data): string
    {
        $regular_agenda = RegularAgenda::where('room_id', $data['room_id'])
            ->firstOrFail();

        $regular_agenda->update([
            'day_of_the_week' => $data['day_of_the_week'],
            'start_time'      => $data['start_time'] ?? null,
            'end_time'        => $data['end_time']   ?? null,
        ]);
        $regular_agenda->refresh();

        $room = Room::findOrFail($data['room_id']);
        return $room->room_name;
    }

    public function deleteRoom(int $id, int $userId): string
    {
        $room = Room::where('user_id', $userId)
                    ->findOrFail($id);

        $path = "rooms/{$room->img_name}";
        if (Storage::disk('private')->exists($path)) {
            Storage::disk('private')->delete($path);
        }

        $roomName = $room->room_name;
        $room->delete();

        return $roomName;
    }

    public function createRoom(string $roomName, string $img_name, int $userId): void
    {
        if (Room::where('user_id', $userId)->count() >= 4) {
            throw new \Exception('部屋は最大４つまでです。');
        }

        $room = Room::create([
            'user_id'   => $userId,
            'room_name' => $roomName,
            'img_name'  => $img_name,
        ]);

        RegularAgenda::create([
            'room_id'        => $room->id,
            'day_of_the_week'=> null,
            'start_time'     => null,
            'end_time'       => null,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $agenda = Agenda::findOrFail($id);
        $agenda->status = $request->status;
        $agenda->save();
    }

    public function updateRoomPhoto($userId, $roomId, $img_name)
    {
        $room = Room::where('user_id', $userId)
                    ->where('id', $roomId)
                    ->firstOrFail();

        if ($room->img_name) {
            Storage::disk('private')->delete('rooms/' . $room->img_name);
        }

        $room->update([
            'img_name' => $img_name,
        ]);
    }

    public function getAiEvaluate($file)
    {
        try {
            $imageBytes = file_get_contents($file->getPathname());

            $rekognition = new RekognitionClient([
                'version' => 'latest',
                'region'  => 'ap-northeast-1',
                'credentials' => [
                    'key'    => env('AWS_ACCESS_KEY_ID'),
                    'secret' => env('AWS_SECRET_ACCESS_KEY'),
                ],
            ]);

            $result = $rekognition->detectCustomLabels([
                'ProjectVersionArn' => 'arn:aws:rekognition:ap-northeast-1:103731009007:project/micelle/version/micelle.2025-05-24T22.45.14/1748094314752',
                'Image' => [
                    'Bytes' => $imageBytes,
                ],
            ]);

            $maxConfidence = max(array_column($result['CustomLabels'], 'Confidence'));
            $filteredLabels = array_filter($result['CustomLabels'], function ($label) use ($maxConfidence) {
                return $label['Confidence'] == $maxConfidence;
            });

            $selectedLabel = reset($filteredLabels);
            $numericValue = isset($selectedLabel['Name'])
                ? (int) filter_var($selectedLabel['Name'], FILTER_SANITIZE_NUMBER_INT)
                : null;

            return $numericValue;
        }
        catch (AwsException $e) {
            throw $e;
        }
    }

    public function updateAiEvaluate($userId, $roomId, $numericValue)
    {
        $latestAgenda = Agenda::where('user_id', $userId)
            ->where('room_id', $roomId)
            ->latest()
            ->first();

        if ($latestAgenda) {
            $aiEvaluate = $latestAgenda->ai_evaluate ?? 0;
            $latestAgenda->update([
                'ai_evaluate' => $numericValue ?? $aiEvaluate,
            ]);
        }
    }

    public function getMicelleMessage(int $numericValue): string
    {
        if ($numericValue >= 90) {
            return '素晴らしい！最高ランクです🎉';
        } elseif ($numericValue >= 70) {
            return 'なかなかいい感じですね！✨';
        } elseif ($numericValue >= 50) {
            return '悪くないけど、もう少し頑張りましょう💪';
        } else {
            return 'ちょっと厳しい結果でしたね…次回に期待！😅';
        }
    }
}
