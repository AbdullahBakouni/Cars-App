<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => 'required|string',
            'brand' => 'required|string',
            'model' => 'nullable|string',
            'year' => 'required|integer',
            'location' => 'nullable|string',
            'price' => 'nullable|numeric|min:1',
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
            'body_type' => 'nullable|string',
            'mileage' => 'nullable|numeric',
            'currency' => 'nullable|string',
            'status' => 'nullable|string',
            'doors' => 'nullable|integer',
            'cylinders' => 'nullable|integer',
            'transmission' => 'nullable|string',
            'fuel' => 'nullable|string',
            'engine' => 'nullable|integer',
            'color' => 'nullable|string',
            'tags' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'removed_images' => 'nullable|array',
            'removed_tags'=>'nullable|array',
        ];
    }
    public function prepareForValidation()
    {
        if ($this->has('price')) {
            // Remove dots as thousand separators and then cast to float
            $price = str_replace('.', '', $this->price);  // Remove all dots
            $this->merge([
                'price' => (float) $price,  // Cast to float after removing dots
            ]);
        }
    }
}
