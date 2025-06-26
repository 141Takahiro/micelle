<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreRegularAgendaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'room_id'         => 'required|integer|exists:rooms,id',
            'day_of_the_week' => 'required|integer|between:1,7',
            'start_time'      => 'nullable|date_format:H:i',
            'end_time'        => [
                'nullable',
                'date_format:H:i',
                function ($attribute, $value, $fail) {
                    $start = $this->input('start_time');
                    if ($start && $value && $value <= $start) {
                        $fail('終了時間は開始時間より後である必要があります。');
                    }
                },
            ],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            redirect()
                ->route('task')
                ->with('error_message', '不適切な入力が実行されました。')
        );
    }
}
