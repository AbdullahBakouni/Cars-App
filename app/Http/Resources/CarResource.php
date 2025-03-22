<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'brand' => $this->brand,
            'model' => $this->model,
            'location' => $this->location,
            'price' => $this->price,
            'year' => $this->year,
            'body_type' => $this->body_type,
            'doors' => $this->doors,
            'cylinders' => $this->cylinders,
            'transmission' => $this->transmission,
            'fuel_type' => $this->fuel_type,
            'color' => $this->color,
            'user' => new UserResource($this->whenLoaded('user')),
            'company' => new CompanyResource($this->whenLoaded('company')),
            'images' => CarImageResource::collection($this->whenLoaded('images')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
