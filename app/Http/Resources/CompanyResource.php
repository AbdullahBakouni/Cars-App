<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
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
            'logo_url' => asset('storage/' . $this->logo_path),
            'rates' => $this->rates,
            'cars' => CarResource::collection($this->whenLoaded('cars')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
