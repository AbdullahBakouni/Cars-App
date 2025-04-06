<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 5000; $i++) {
            $car = Car::create([
                'user_id' => 1,
                'company_id' => 1,
                'phone_id' => 1,
                'description' => 'This is car number #' . $i,
                'brand' => 'Audi',
                'model' => 'A' . rand(1, 8),
                'body_type' => 'Sedan',
                'mileage' => rand(1000, 200000),
                'currency' => ['SYP', 'USD'][rand(0, 1)],
                'status' => ['sell', 'rent', 'rented', 'sold'][rand(0, 3)],
                'rates' => rand(10, 50) / 10,
                'engine' => rand(1000, 4000),
                'color' => ['Black', 'White', 'Red', 'Blue'][rand(0, 3)],
                'location' => 'Damascus',
                'year' => rand(2000, 2024),
                'doors' => rand(2, 5),
                'cylinders' => rand(4, 8),
                'transmission' => ['manual', 'automatic'][rand(0, 1)],
                'fuel' => ['gasoline', 'diesel', 'electric'][rand(0, 2)],
                'price' => rand(50000000, 300000000),
            ]);

            // صورة ثابتة لكل سيارة
            CarImage::create([
                'car_id' => $car->id,
                'image_path' => '/images/AlfaRomeo.jpg', // المسار تحت public/storage
            ]);
        }
    }
}
