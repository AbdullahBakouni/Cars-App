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
    'model' => 'required|string|max:255|regex:/^[A-Za-z0-9\s-]+$/u',
    'year' => 'required|integer|min:1900|max:' . date('Y'),
    'location' => 'required|string|max:255',
    'price' => 'required|numeric|min:0',
    'phone' => ['', 'required', 'regex:/^\+963\s?\d{3}\s?\d{3}?\s?\d{3,4}$/'],
    'whatsapp' => ['nullable', 'regex:/^\+963\s?\d{3}\s?\d{3}?\s?\d{3,4}$/'],
    'company_name' => [
        'nullable',
        'required_with:company_logo', // ✅ Ensures company_name is required if company_logo exists
        'string',
        'max:255'
    ],
    'company_location' => [
        'nullable',
        'required_with:company_logo', // ✅ Ensures company_location is required if company_logo exists
        'string',
        'max:255'
    ],
    'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
    'body_type' => 'required|string|max:50',
    'currency' => 'required',
    'engine' => 'nullable',
    'status' => 'required',
    'mileage' => 'required|numeric',
    'doors' => 'required|integer|min:2|max:6',
    'cylinders' => 'required|string|max:20',
    'transmission' => 'required|string|max:50',
    'fuel' => 'nullable|string|max:50',
    'color' => 'required|string|max:50',
    'images' => 'required|array',
    'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
    'tags' => 'nullable|array',
    'tags.*' => 'string|max:50',
        ];
    }
}
