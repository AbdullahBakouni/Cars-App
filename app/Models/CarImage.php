<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarImage extends Model
{
    protected $fillable = ['car_id', 'image_path'];

    // Inverse of the one-to-many relationship with Car
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
