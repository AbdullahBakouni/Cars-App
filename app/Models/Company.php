<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $table = 'company';

    protected $fillable = ['company_id','logo_path','company_name','user_id','rates','location'];

    // Inverse of the one-to-many relationship with Car
    public function cars(): HasMany
    {
        return $this->hasMany(Car::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }
    
    public function calculateAverageRating()
    {
        return $this->reviews()->avg('rating'); // Returns the average rating as a float
    }

    // Method to update the company's rate
    public function updateCompanyRating()
    {
        $averageRating = $this->calculateAverageRating();
        $this->rates = $averageRating; // Set the company's rate to the average rating
        $this->save(); // Save the updated rate
    }
}
