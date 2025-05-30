<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\Agenda;
use Aws\Rekognition\RekognitionClient;
use Illuminate\Support\Facades\Storage;

class HomeController extends Controller
{
    public function show()
    {
        $rooms = Room::where('user_id', auth()->id())
            ->with(['agendas' => function ($query) {
                $query->latest('created_at')->limit(10);
            }])
            ->get();

        return Inertia::render('Home', [
            'rooms' => $rooms,  
            'updatePhoto_message' => session('updatePhoto_message'),
            'micelle_message' => session('micelle_message'),
            'score' => session('score'),
            'image_url' => session('image_url')
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $agenda = Agenda::findOrFail($id);

        $agenda->status = $request->status;
        $agenda->save();
    }

    public function updatePhoto(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            $file = $request->file('image');
            $img_name = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('rooms', $img_name, 'private');

            $room = Room::find($id);
            if ($room) {
                if ($room->img_name) {
                    Storage::disk('private')->delete('rooms/' . $room->img_name);
                }

                $room->update([
                    'img_name' => $img_name,
                ]);
            } else {
                return redirect()->route('home')->with('updatePhoto_message', '対象の部屋が見つかりません。');
            }

            $img_url = route('home.room.img', ['img_name' => $img_name]);
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

            $filteredLabels = array_filter($result['CustomLabels'], function($label) use ($maxConfidence) {
                return $label['Confidence'] == $maxConfidence;
            });

            $selectedLabel = reset($filteredLabels);
            $numericValue = isset($selectedLabel['Name']) ? (int) filter_var($selectedLabel['Name'], FILTER_SANITIZE_NUMBER_INT) : null;

            $latestAgenda = Agenda::where('user_id', auth()->id())
                      ->where('room_id', $id)
                      ->latest()
                      ->first();

            if ($latestAgenda) {
                $aiEvaluate = $latestAgenda->ai_evaluate ?? 0;
                $latestAgenda->update([
                    'ai_evaluate' => $numericValue ?? $aiEvaluate
                ]);
            }

            $micelleMessage = '';

            if ($numericValue >= 90) {
                $micelleMessage = '素晴らしい！最高ランクです🎉';
            } elseif ($numericValue >= 70) {
                $micelleMessage = 'なかなかいい感じですね！✨';
            } elseif ($numericValue >= 50) {
                $micelleMessage = '悪くないけど、もう少し頑張りましょう💪';
            } else {
                $micelleMessage = 'ちょっと厳しい結果でしたね…次回に期待！😅';
            }

            $data = [
                'score' => $numericValue,
                'image_url' => $img_url,
                'updatePhoto_message' => 'お部屋を登録したよ！',
                'micelle_message' => $micelleMessage,
            ];

            return redirect()->route('home')->with($data);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->route('home')->with('updatePhoto_message', 'バリデーションエラーが発生しました。');
        } catch (\Exception $e) {
            return redirect()->route('home')->with('updatePhoto_message', '予期しないエラーが発生しました。');
        }
    }

    public function getRoomImage($img_name)
    {
        $path = "rooms/{$img_name}";
        
        if (!Storage::disk('private')->exists($path)) {
            abort(404, '画像が見つかりません');
        }

        return Response::make(Storage::disk('private')->get($path), 200, [
            'Content-Type' => Storage::disk('private')->mimeType($path),
            'Content-Disposition' => 'inline; filename="' . $img_name . '"'
        ]);
    }
    
}
