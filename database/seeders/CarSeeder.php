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
            'number' => '+963 968679572',
        ], [
            'user_id' => 1,
        ]);
        $cylinders_values = ['Electric', '2', '4', '8', '10', '12', '16'];
        $body_type_values = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Other', 'Hatch', 'Wagon'];
        // نقوم بإنشاء 100,000 سيارة
        for ($i = 1; $i <= 100000; $i++) {
            // إنشاء الشركة المرتبطة بالسيارة
            $company = Company::create([
                'user_id' => 1,
                'company_name' => 'Company ' . $i,
                'logo_path' => '/logos/67f2d0b815646.webp', // المسار الخاص بالشعار
                'rates' => rand(1, 5), // التقييم العشوائي
                'location' => 'Damascus', // أو أي موقع ترغب فيه
            ]);

            $car = Car::create([
                'user_id' => 1,
                'company_id' => $company->id, // ربط السيارة بالشركة
                'phone_id' =>  $phone->id,
                'description' => 'This is car number #' . $i,
                'brand' => 'Audi',
                'model' => 'A' . rand(1, 8),
                'body_type' => $body_type_values[array_rand($body_type_values)],
                'mileage' => rand(1000, 200000),
                'currency' => ['SYP', 'USD'][rand(0, 1)],
                'status' => ['sell', 'rent', 'rented', 'sold'][rand(0, 3)],
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

            // إضافة صورة للسيارة
            CarImage::create([
                'car_id' => $car->id,
                'image_path' => '/car_images/67f2de3a45ec9.webp', // المسار تحت public/storage
            ]);

            // إضافة 400 مراجعة عشوائية لكل سيارة
            for ($j = 1; $j <= 400; $j++) {
                Review::create([
                    'user_id' => 1, // استخدام نفس الـ user_id
                    'car_id' => $car->id,
                    'company_id' => $company->id,
                    'comment' => 'This is a review comment for car #' . $i . ' by user 1',
                    'rating' => rand(1, 5), // التقييم العشوائي
                ]);
            }

            // إضافة 3 Tags عشوائية لكل سيارة
            for ($k = 1; $k <= 3; $k++) {
                Tag::create([
                    'car_id' => $car->id, // نفس الـ user_id
                    'name' => 'Tag ' . $k . ' for car #' . $i,
                ]);
            }
        }
    }
}
