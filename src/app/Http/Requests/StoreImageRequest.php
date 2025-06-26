<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreImageRequest extends FormRequest
{
    public function rules(): array
    {
         return [
             'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
         ];
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
