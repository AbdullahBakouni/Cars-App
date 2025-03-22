<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255|regex:/^[a-zA-Z0-9\s]*$/',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
            'location' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'phone' => ['required', 'regex:/^\+963\s?\d{3}\s?\d{3}?\s?\d{3,4}$/'],
            "whatsapp" => ['nullable', 'regex:/^\+963\s?\d{3}\s?\d{3}?\s?\d{3,4}$/'],
            "company_log" => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            "company_name" => 'nullable|string|max:255',
            'body_type' => 'required|string|max:50',
            'doors' => 'required|integer|min:2|max:6',
            'cylinders' => 'required|string|max:20',
            'transmission' => 'required|string|max:50',
            'fuel' => 'required|string|max:50',
            'color' => 'required|string|max:50',
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ];
    }
}
