<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tag extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'car_id','name'];
    
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
