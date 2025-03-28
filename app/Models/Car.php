<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Car extends Model
{
    use HasFactory;

    // Define the table name if it's not the plural form of the model name
    protected $table = 'cars';  

    // Specify the fillable fields for mass assignment
    protected $fillable = [
        'title', 'description', 'brand', 'model', 'year', 'location', 'price', 'phone', 'whatsapp',
        'body_type', 'doors', 'cylinders', 'transmission', 'fuel', 'color', 'company_id'
    ];
    // Define relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(CarImage::class);
    }
   
    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    protected $casts = [
        'tags' => 'array',
        'images' => 'array',
    ];
}
