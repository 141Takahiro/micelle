<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreRoomNameRequest extends FormRequest
{
    public function rules(): array
    {
         return [
             'room_name' => 'required|string|min:2|max:20',
         ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            redirect()
                ->route('preparation')
                ->with('error_message', '不適切な入力が実行されました。')
        );
    }
}
