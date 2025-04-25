<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\CarImage;
use App\Models\Company;
use App\Models\Phone;
use App\Models\Review;
use App\Models\Tag;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $phone = Phone::firstOrCreate([
            'number' => '+963 968679573',
        ], [
            'user_id' => 2,
        ]);
    
        $cylinders_values = ['Electric', '2', '4', '8', '10', '12', '16'];
        $body_type_values = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Other', 'Hatch', 'Wagon'];
        $statuses = ['sell', 'rent'];
        $images = ['67fe7ca76fd06.webp', '68052385f19d8.webp'];
    
        for ($i = 1; $i <= 100; $i++) {
            $car = Car::create([
                'user_id' => 2,
                'company_id' => null, // بدون شركة
                'phone_id' => $phone->id,
                'description' => 'This is car number #' . $i,
                'brand' => 'Audi',
                'model' => 'A' . rand(1, 8),
                'body_type' => $body_type_values[array_rand($body_type_values)],
                'mileage' => rand(1000, 200000),
                'currency' => ['SYP', 'USD'][rand(0, 1)],
                'status' => $statuses[array_rand($statuses)],
                'rates' => rand(10, 50) / 10,
                'engine' => rand(1000, 4000),
                'color' => ['Black', 'White', 'Red', 'Blue'][rand(0, 3)],
                'location' => 'Damascus',
                'year' => rand(2000, 2024),
                'doors' => rand(2, 5),
                'cylinders' => $cylinders_values[array_rand($cylinders_values)],
                'transmission' => ['manual', 'automatic'][rand(0, 1)],
                'fuel' => ['gasoline', 'diesel', 'electric'][rand(0, 2)],
                'price' => rand(50000000, 300000000),
            ]);
    
            // إضافة الصورتين لكل سيارة
            foreach ($images as $img) {
                CarImage::create([
                    'car_id' => $car->id,
                    'image_path' => '/car_images/' . $img,
                ]);
            }
    
            // إضافة 10 مراجعات فقط
            for ($j = 1; $j <= 10; $j++) {
                Review::create([
                    'user_id' => 2,
                    'car_id' => $car->id,
                    'company_id' => null, // بدون شركة
                    'comment' => 'This is a review comment for car #' . $i . ' by user 1',
                    'rating' => rand(1, 5),
                ]);
            }
    
            // إضافة 3 Tags
            for ($k = 1; $k <= 3; $k++) {
                Tag::create([
                    'car_id' => $car->id,
                    'name' => 'Tag ' . $k . ' for car #' . $i,
                ]);
            }
        }
    }
}    
