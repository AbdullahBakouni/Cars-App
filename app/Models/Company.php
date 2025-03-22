<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $table = 'company';

    protected $fillable = ['company_id','logo_path','company_name','user_id'];

    // Inverse of the one-to-many relationship with Car
    public function cars(): HasMany
    {
        return $this->hasMany(Car::class);
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
