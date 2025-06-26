<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PreparationRequest extends FormRequest
{
    public function rules(): array
    {
        $storeImageRules = (new StoreImageRequest())->rules();
        $storeRoomNameRules = (new StoreRoomNameRequest())->rules();

        return array_merge($storeImageRules, $storeRoomNameRules);
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            redirect()
                ->route('home')
                ->with('error_message', '不適切な入力が実行されました。')
        );
    }
}
