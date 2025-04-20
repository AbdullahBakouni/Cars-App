<?php

namespace App\Http\Controllers;

use App\Http\Requests\CarRequest;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\Company;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;


class CarController extends Controller
{
   

    private function resizeAndCompress($source, $destination, $maxWidth = 1280, $quality = 70, $convertToWebP = true)
{
    $info = getimagesize($source);
    [$width, $height] = $info;

    $mime = $info['mime'];

    switch ($mime) {
        case 'image/jpeg':
            $image = imagecreatefromjpeg($source);
            break;
        case 'image/png':
            $image = imagecreatefrompng($source);
            break;
        default:
            return false; // نوع غير مدعوم
    }

    // تغيير الأبعاد إذا لزم الأمر
    if ($width > $maxWidth) {
        $ratio = $maxWidth / $width;
        $newWidth = $maxWidth;
        $newHeight = $height * $ratio;

        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    } else {
        $resized = $image;
    }

    // تحويل إلى WebP إن أردت
    if ($convertToWebP) {
        $destination = preg_replace('/\.\w+$/', '.webp', $destination);
        imagewebp($resized, $destination, $quality);
    } else {
        if ($mime === 'image/jpeg') {
            imagejpeg($resized, $destination, $quality);
        } else {
            $pngQuality = (int) round((100 - $quality) / 10);
            imagepng($resized, $destination, $pngQuality);
        }
    }

    imagedestroy($resized);
    if ($resized !== $image) imagedestroy($image);

    return $destination; // نرجع المسار الجديد
}

    
    public function store(CarRequest $request)
    {
        try {
            DB::beginTransaction(); // ✅ ضمان تنفيذ جميع العمليات أو إلغاء الكل
            
            $validatedData = $request->validated();
            $data = Arr::except($validatedData, ['images', 'company_name', 'company_logo', 'tags', 'phone', 'company_location']);
    
            if ($request->has('price')) {
                $data['price'] = (float) $request->price; // ✅ التأكد من أن السعر رقم عشري
            }
    
            $user = Auth::user();
            if (!$user instanceof User) {
                return response()->json(['error' => 'User is not authenticated'], 401);
            }
    
            // ✅ معالجة رقم الهاتف إن وجد
            if ($request->filled('phone')) {
                $normalizedPhone = preg_replace('/\D/', '', $request->phone);
    
                if (substr($normalizedPhone, 0, 2) === '09' && strlen($normalizedPhone) === 10) {
                    $normalizedPhone = '+963 ' . substr($normalizedPhone, 1);
                } elseif (substr($normalizedPhone, 0, 3) === '963' && strlen($normalizedPhone) === 12) {
                    $normalizedPhone = '+963 ' . substr($normalizedPhone, 3);
                } else {
                    return response()->json(['error' => 'Invalid phone number format. It should start with +963 or 09.'], 400);
                }
    
                // ✅ البحث عن الهاتف أو إنشاؤه إن لم يكن موجودًا
                $phone = $user->phones()->firstOrCreate(['number' => $normalizedPhone]);
                $data['phone_id'] = $phone->id;
            }
    
            // ✅ إنشاء السيارة
            $car = $user->cars()->create($data);

            session(['current_car_id' => $car->id]);
            // ✅ معالجة الصور
            if ($request->hasFile('images')) {
                $images = [];
            
                $carImagesDir = storage_path('app/public/car_images');
                if (!file_exists($carImagesDir)) {
                    mkdir($carImagesDir, 0755, true); // أنشئ المجلد إذا مو موجود
                }
            
                foreach ($request->file('images') as $image) {
                    $originalPath = $image->store('temp_images', 'public');
                    $absolutePath = storage_path('app/public/' . $originalPath);
            
                    $newFileName = uniqid() . '.webp';
                    $compressedPath = 'car_images/' . $newFileName;
                    $destinationPath = storage_path('app/public/' . $compressedPath);
            
                    $this->resizeAndCompress($absolutePath, $destinationPath, 1280, 70, true);
                    
                    unlink($absolutePath);
            
                    $images[] = [
                        'car_id' => $car->id,
                        'image_path' => $compressedPath,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            
                CarImage::insert($images);
            }
            
            
            if ($request->filled('company_id')) {
                $car->update(['company_id' => $request->company_id]);

                session(['current_company_id' => $request->company_id]);
            }
            elseif ($request->filled('company_name') || $request->hasFile('company_logo')) {
                $logoPath = null;
            
                // ⏳ معالجة الشعار إن وُجد
                if ($request->hasFile('company_logo')) {
                    $tempLogoPath = $request->file('company_logo')->store('temp_logos', 'public');
                    $absoluteLogoPath = storage_path('app/public/' . $tempLogoPath);
                
                    $newLogoName = uniqid() . '.webp';
                    $compressedLogoPath = 'logos/' . $newLogoName;
                    $destinationLogoPath = storage_path('app/public/' . $compressedLogoPath);
                
                    // تأكد من وجود مجلد logos
                    $logosDir = storage_path('app/public/logos');
                    if (!file_exists($logosDir)) {
                        mkdir($logosDir, 0755, true);
                    }
                
                    $this->resizeAndCompress($absoluteLogoPath, $destinationLogoPath, 512, 80, true);
                    unlink($absoluteLogoPath);
                
                    $logoPath = $compressedLogoPath;
                }
                
            
                // 🔍 البحث عن شركة موجودة بنفس الاسم والموقع (بدون حساسية لحالة الأحرف)
                $existingCompany = Company::where('user_id', $user->id)
                    ->whereRaw('LOWER(company_name) = ?', [strtolower($request->company_name)])
                    ->whereRaw('LOWER(location) = ?', [strtolower($request->company_location)])
                    ->first();
            
                if ($existingCompany) {
                    // ✅ التأكد إن الشعار نفسه أو لا
                    $isSameLogo = $logoPath === null || $existingCompany->logo_path === $logoPath;
            
                    if (!$isSameLogo && $logoPath !== null) {
                        // 🛠️ تحديث الشعار إذا تغير
                        $existingCompany->update(['logo_path' => $logoPath]);
                    }
            
                    // ربط السيارة بالشركة الموجودة
                    $car->update(['company_id' => $existingCompany->id]);

                    session(['current_company_id' => $existingCompany->id]);
                } else {
                    // 🆕 إنشاء شركة جديدة
                    $company = Company::create([
                        'user_id' => $user->id,
                        'company_name' => $request->company_name,
                        'location' => $request->company_location,
                        'logo_path' => $logoPath,
                    ]);
            
                    $car->update(['company_id' => $company->id]);

                    session(['current_company_id' => $company->id]);
                }
            }
            
    
            // ✅ حفظ الوسوم (Tags)
            if ($request->filled('tags')) {
                $tags = is_string($request->tags) ? explode(',', $request->tags) : $request->tags;
                $tagData = array_map(fn($tag) => ['name' => trim($tag), 'car_id' => $car->id], $tags);
                Tag::insert($tagData); // ✅ إدخال دفعة واحدة
            }
    
            DB::commit(); // ✅ تنفيذ جميع العمليات
            session()->forget(['company_id', 'company_name', 'company_logo', 'company_location']);
            return redirect()->route('cars.show');

        } catch (\Exception $e) {
            DB::rollBack(); // ❌ إلغاء العمليات في حال حدوث خطأ
            return response()->json(['error' => 'Something went wrong: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * عرض سيارة معينة
     */
    public function show()
    {
        try {
            $user = Auth::user();

            $carId = session()->get('current_car_id');

            // 🚀 Optimized eager loading with selected columns only
            $car = Car::with(['images','company','user','reviews','company.reviews','reviews.user','phone'])->findOrFail($carId);
            // 💡 Optimized grouping for reviews by user_id

    
            // 💰 Price logic
            $carPrice = $car->price;
            $carCurrency = $car->currency;
            $tolerance = $carPrice * 0.1;
            $minPrice = $carPrice - $tolerance;
            $maxPrice = $carPrice + $tolerance;
    
            // 🚀 Suggested cars: minimal fields, smart filters
            $suggestedCars = Car::with(['images:id,car_id,image_path', 'tags:id,name'])
                ->select(['id', 'brand', 'model', 'year', 'body_type', 'cylinders', 'price', 'currency'])
                ->where([
                    ['body_type', $car->body_type],
                    ['model', $car->model],
                    ['brand', $car->brand],
                    ['year', $car->year],
                    ['cylinders', $car->cylinders],
                    ['id', '!=', $car->id],  // Exclude the current car
                    ['currency', $carCurrency],
                ])
                ->whereBetween('price', [$minPrice, $maxPrice])
                ->limit(5)
                ->get();
    
            return Inertia::render('cars_details/Show', [
                'car' => $car,
                'suggestedCars' => $suggestedCars,
                'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                    ? $user->hasVerifiedEmail()
                    : false,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Errors/NotFound', [
                'message' => 'Car not found.'
            ])->toResponse(request());
        }
    }
    
    
    

    /**
     * تحديث بيانات السيارة
     */
    public function edit()
     {
        $carId = session()->get('current_car_id');
        $car = Car::with(['images','company','tags'])->findOrFail($carId);
        $user = Auth::user();
         return Inertia::render('Update-Cars/Update', ['car' => $car,
         'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
        ? $user->hasVerifiedEmail()
        : false,
        ]);
    }

    
    public function update(Request $request,$id)
    {
      

        $car = Car::findOrFail($id);

        $validated = $request->validate([
            'description' => 'required|string',
            'brand' => 'required|string',
            'model' => 'nullable|string',
            'year' => 'required|integer',
            'location' => 'nullable|string',
            'price' => 'nullable|string|min:1',
            'body_type' => 'nullable|string',
            'mileage' => 'nullable|string',
            'currency' => 'nullable|string',
            'status' => 'nullable|string',
            'condition' => 'nullable',
            'rental_type' => 'nullable',
            'doors' => 'nullable|integer',
            'cylinders' => 'nullable|string|max:20',
            'transmission' => 'nullable|string',
            'fuel' => 'nullable|string',
            'engine' => 'nullable|integer',
            'color' => 'nullable|string',
            'tags' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'removed_images' => 'nullable|array',
            'removed_tags'=>'nullable|array',
        ]);

        if ($request->has('price')) {
            // Remove dots as thousand separators and then cast to float
            $price = str_replace('.', '', $request->price);  // Remove all dots
            $validated['price'] = (float) $price;  // Cast to float after removing dots
        }

        if ($request->has('mileage')) {
            // Remove dots as thousand separators and then cast to float
            $mileage = str_replace('.', '', $request->mileage);  // Remove all dots
            $validated['mileage'] = (float) $mileage;  // Cast to float after removing dots
        }
       
        // Update the car fields (excluding phone & WhatsApp)
        $car->update(collect($validated)->except(['tags','removed_tags'])->toArray());
    
    
        // Handle new images
        if ($request->hasFile('new_images')) {
            $images = [];
        
            foreach ($request->file('new_images') as $image) {
                // خزّن الصورة مؤقتاً
                $originalPath = $image->store('temp_images', 'public');
                $absolutePath = storage_path('app/public/' . $originalPath);
        
                // حدد اسم جديد وامتداد webp
                $newFileName = uniqid() . '.webp';
                $compressedPath = 'car_images/' . $newFileName;
                $destinationPath = storage_path('app/public/' . $compressedPath);
        
                // ضغط وتغيير حجم الصورة
                $this->resizeAndCompress($absolutePath, $destinationPath, 1280, 70, true);
        
                // احذف الصورة الأصلية المؤقتة
                unlink($absolutePath);
        
                // إضافة البيانات إلى المصفوفة
                $images[] = [
                    'car_id' => $car->id,  // إضافة car_id
                    'image_path' => $compressedPath,
                    'created_at' => now(), // تأكد من إضافة تاريخ الإنشاء
                    'updated_at' => now(), // تأكد من إضافة تاريخ التحديث
                ];
            }
        
            // إدخال الصور في قاعدة البيانات دفعة واحدة
            CarImage::insert($images);
        }
    
        // Handle image removal
        if ($request->removed_images) {
            foreach ($request->removed_images as $imageId) {
                $image = CarImage::find($imageId);
                if ($image) {
                    Storage::disk('public')->delete($image->image_path); // Delete from storage
                    $image->delete(); // Delete from DB
                }
            }
        }
        if ($request->has('removed_tags')) {
            // حذف العلامات التي تم تحديدها للإزالة
            Tag::where('car_id', $id)->whereIn('id', $request->removed_tags)->delete();
        }
        
        if ($request->has('tags')) {
            $tagIds = [];
        
            foreach ($request->tags as $tagData) {
                if (isset($tagData['isNew']) && $tagData['isNew'] === true) {
                    // العلامة جديدة - إنشاؤها في قاعدة البيانات
                    $tag = Tag::create([
                        'name' => $tagData['name'],
                        'car_id' => $id
                    ]);
                    $tagIds[] = $tag->id; // حفظ الـ ID الحقيقي من قاعدة البيانات
                } elseif (isset($tagData['id']) && is_numeric($tagData['id'])) {
                    // التحقق من وجود العلامة في قاعدة البيانات
                    $tag = Tag::where('id', $tagData['id'])->where('car_id', $id)->first();
                    if ($tag) {
                        $tagIds[] = $tag->id;
                    }
                }
            }
        
            // حذف العلامات غير الموجودة في القائمة الجديدة
            Tag::where('car_id', $id)->whereNotIn('id', $tagIds)->delete();
        }
        
        session()->flash("success","Car was Updtaed successfully");
        return redirect()->route('cars.my');
    }
    


    
    

    /**
     * حذف سيارة
     */
    
    
    public function destroy(Request $request)
    {
        // اسحب car_id من الجلسة واحذفه من الجلسة مباشرة
        $carId = session()->pull('current_car_id');
    
        if (!$carId) {
            abort(404, 'No car ID found in session.');
        }
    
        // تحميل السيارة مع الصور
        $car = Car::with(['images'])->findOrFail($carId);


        $carImages = CarImage::where('car_id', $carId)->get();
       

    if ($carImages && $carImages->count() > 0) {

    foreach ($carImages as $image) {
        $imagePath = $image->image_path;
       
         if (Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
         }
    }

    // حذف سجلات الصور من قاعدة البيانات
     $car->images()->delete();
}

// حذف السيارة
     $car->delete();
    
        // جلب رقم الصفحة الحالي إذا موجود
        $page = $request->input('page', 1);
    
        session()->flash("success", "Car was deleted successfully");
    
        // إعادة التوجيه لصفحة سيارات المستخدم
        return redirect()->route('cars.my', ['page' => $page]);
    }
    
    


    public function getModels(Request $request)
    {
        $brand = $request->query('brand');
    
        // Fetch distinct models and count each occurrence
        $models = Car::where('brand', $brand)
        ->selectRaw('model, COUNT(*) as count') // Count occurrences
        ->groupBy('model')
        ->get();

    // Get the total number of distinct models
        $totalModels = $models->count(); 
    
        return response()->json([
            'total_models' => $totalModels,
            'models' => $models
        ]);
    }

    public function filterCars(Request $request)
{
    $filters = $request->all();
    $query = Car::query();

    foreach ([
        'brand_name' => 'brand',
        'model_name' => 'model',
        'body_type'  => 'body_type',
        'currency'   => 'currency',
        'status'     => 'status',
        'rental_type'=> 'rental_type',
        'condition'  => 'condition',
        'doors'      => 'doors',
        'cylinders'  => 'cylinders',
        'engine'     => 'engine',
        'transmission'=> 'transmission',
        'fuel'       => 'fuel',
        'color'      => 'color',
        'location'   => 'location',
    ] as $param => $column) {
        $value = $request->query($param, $filters[$param] ?? null);
        if (!empty($value)) {
            $query->where($column, $value);
        }
    }

    // 🔢 فلترة بالسنة
    if (!empty($filters['yearfrom'])) {
        $query->where('year', '>=', $filters['yearfrom']);
    }
    if (!empty($filters['yearto'])) {
        $query->where('year', '<=', $filters['yearto']);
    }

    // 💰 فلترة بالسعر
    if (!empty($filters['pricefrom'])) {
        $query->where('price', '>=', $filters['pricefrom']);
    }
    if (!empty($filters['priceto'])) {
        $query->where('price', '<=', $filters['priceto']);
    }

    // 📊 فلترة بالكيلومترات
    if (!empty($filters['mileagefrom'])) {
        $query->where('mileage', '>=', $filters['mileagefrom']);
    }
    if (!empty($filters['mileageto'])) {
        $query->where('mileage', '<=', $filters['mileageto']);
    }
    return response()->json([
        'count' => $query->count(),
    ]);
}

private function getExchangeRate($base = 'USD')
{
    $apiUrl = env('EXCHANGE_API_URL', 'https://v6.exchangerate-api.com/v6/f22811ef8e6bb9fb048a16a6/latest/USD');

    $response = Http::get("$apiUrl/$base");

    if ($response->ok()) {
        return $response->json()['rates'];
    }

    return null;
}

    public function getCarsByBodyType(Request $request)
{
    $user = Auth::user();

    // 🧠 جميع الفلاتر المحتملة من الفورم أو الروابط
    $filters = $request->all();

    $sortBy = $request->query('sort', 'posted');
    $categoryName = $request->query('category');
    $price = $request->query('maxPrice');

    $selectFields = ['id', 'brand', 'model', 'year', 'mileage', 'description', 'rates', 'price', 'currency', 'status', 'rental_type', 'condition'];

    // 🔋 إذا التصنيف يتطلب cylinders
    $categoriesRequiringCylinders = ['Elecrtic', 'Sport', 'SuperCars', 'Adventure'];
    if (in_array($categoryName, $categoriesRequiringCylinders)) {
        $selectFields[] = 'cylinders';
    }

    $query = Car::select($selectFields)
        ->with([
            'images' => fn($q) => $q->select('car_id', 'image_path')->limit(1),
            'tags' => fn($q) => $q->select('car_id', 'name')->limit(2),
            'company'
        ]);

    // 🎯 الترتيب
    match ($sortBy) {
        'price-low'    => $query->orderBy('price', 'asc'),
        'price-high'   => $query->orderBy('price', 'desc'),
        'year-new'     => $query->orderBy('year', 'desc'),
        'year-old'     => $query->orderBy('year', 'asc'),
        'mileage-low'  => $query->orderBy('mileage', 'asc'),
        'mileage-high' => $query->orderBy('mileage', 'desc'),
        default        => $query->orderBy('created_at', 'desc'),
    };

    // ⚙️ فلترة حسب القيم العامة (من form أو query)
    foreach ([
        'brand_name' => 'brand',
        'model_name' => 'model',
        'body_type'  => 'body_type',
        'currency'   => 'currency',
        'status'     => 'status',
        'rental_type'=> 'rental_type',
        'condition'  => 'condition',
        'doors'      => 'doors',
        'cylinders'  => 'cylinders',
        'engine'     => 'engine',
        'transmission'=> 'transmission',
        'fuel'       => 'fuel',
        'color'      => 'color',
        'location'   => 'location',
    ] as $param => $column) {
        $value = $request->query($param, $filters[$param] ?? null);
        if (!empty($value)) {
            $query->where($column, $value);
        }
    }

    // 🔢 فلترة بالسنة
    if (!empty($filters['yearfrom'])) {
        $query->where('year', '>=', $filters['yearfrom']);
    }
    if (!empty($filters['yearto'])) {
        $query->where('year', '<=', $filters['yearto']);
    }

    // 💰 فلترة بالسعر
    if (!empty($filters['pricefrom'])) {
        $query->where('price', '>=', $filters['pricefrom']);
    }
    if (!empty($filters['priceto'])) {
        $query->where('price', '<=', $filters['priceto']);
    }

    // 📊 فلترة بالكيلومترات
    if (!empty($filters['mileagefrom'])) {
        $query->where('mileage', '>=', $filters['mileagefrom']);
    }
    if (!empty($filters['mileageto'])) {
        $query->where('mileage', '<=', $filters['mileageto']);
    }

    // 🧩 فلترة حسب الفئة
    match ($categoryName) {
        'Economy' => $query->where(function ($q) {
            $q->where('currency', 'SYP')->whereBetween('price', [20_000_000, 60_000_000]);
        })->orWhere(function ($q) {
            $q->where('currency', 'USD')->whereBetween('price', [2_000, 6_000]);
        }),
        'Family' => $query->where('body_type', 'suv')->whereIn('doors', [4, 5]),
        'Elecrtic' => $query->where('cylinders', 'Electric'),
        'Luxury' => $query->where('body_type', 'sedan')->where(function ($q) {
            $q->where(function ($qq) {
                $qq->where('currency', 'SYP')->whereBetween('price', [100_000_000, 1_200_000_000]);
            })->orWhere(function ($qq) {
                $qq->where('currency', 'USD')->whereBetween('price', [100_000, 220_000]);
            });
        }),
        'Sport' => $query->where('body_type', 'coupe')->where(function ($q) {
            $q->whereIn('cylinders', [6, 8, 10])->where(function ($qq) {
                $qq->where('currency', 'SYP')->whereBetween('price', [50_000_000, 100_000_000]);
            })->orWhere(function ($qq) {
                $qq->where('currency', 'USD')->whereBetween('price', [50_000, 510_000]);
            });
        }),
        'SuperCars' => $query->where('body_type', 'coupe')->where(function ($q) {
            $q->whereIn('cylinders', [8, 10, 12, 16])->where(function ($qq) {
                $qq->where('currency', 'SYP')->whereBetween('price', [60_000_000, 140_000_000]);
            })->orWhere(function ($qq) {
                $qq->where('currency', 'USD')->whereBetween('price', [60_000, 120_000]);
            });
        }),
        'Adventure' => $query->where('body_type', 'suv')->where(function ($q) {
            $q->whereIn('cylinders', [6, 8])->where(function ($qq) {
                $qq->where('currency', 'SYP')->whereBetween('price', [30_000_000, 60_000_000]);
            })->orWhere(function ($qq) {
                $qq->where('currency', 'USD')->whereBetween('price', [30_000, 60_000]);
            });
        }),
        'Utility' => $query->where(function ($q) {
            $q->where('body_type', 'minivan')->orWhere('body_type', 'pickup');
        }),
        default => null,
    };

    // 💰 استثناء إذا بس في سعر وما في فلاتر أخرى
    if (empty($filters['brand_name']) && empty($filters['model_name']) && empty($filters['body_type']) && $price !== null) {
        if (!is_numeric($price)) {
            return back()->withErrors(['price' => 'يجب إدخال سعر صحيح.']);
        }

        $cars = Car::select($selectFields)
            ->when($filters['currency'] === 'SYP', fn($q) => $q->whereBetween('price', [$price - 10000000, $price + 10000000]))
            ->when($filters['currency'] === 'USD', fn($q) => $q->whereBetween('price', [$price - 1000, $price + 1000]))
            ->where('currency', $filters['currency'])
            ->orderByRaw("ABS(price - ?)", [$price])
            ->with(['images' => fn($q) => $q->select('car_id', 'image_path')->limit(1), 'tags'])
            ->paginate(40);
    } else {
        $cars = $query->paginate(10);
    }
    return Inertia::render('cars/CarSearchResults', [
        'cars' => $cars,
        'totalResults' => $cars->total(),
        'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
            ? $user->hasVerifiedEmail()
            : false,
        'filters' => array_merge($filters, [
            'sortBy' => $sortBy,
            'price' => $price,
            'categoryName' => $categoryName,
        ]),
    ]);
}

    
    public function updateStatus(Request $request)
    {
        $request->validate([
            'car_id' => 'required|exists:cars,id',
            'status' => 'required|string|in:sell,rent,rented,sold',
            'page' => 'nullable|integer',
            'company_id' => 'nullable|integer|exists:company,id',
        ]);

        $user = Auth::user();
        $car = Car::where('user_id', $user->id)->findOrFail($request->car_id);
        $car->status = $request->status;
        $car->save();
        session()->flash('selectedCompanyId', $request->input('company_id'));

        session()->flash("success","Car was Updated successfully");

        // 🔁 بعد التحديث، redirect لنفس الصفحة مع flash message
        return redirect()->route('cars.my', [
            'page' => $request->input('page', 1),
        ]);
    }
    


    public function myCars(Request $request)
    {
        
        $user = Auth::user();
    
        // Get sort option from the request (default to 'default' if not provided)
        $currentPage = $request->input('page', 1);
      $companyId = $request->input('company_id', session('selectedCompanyId'));
        $cars = $this->getUserCars($user,$currentPage,$companyId);
    
        // Return the cars with other relevant info
        return Inertia::render('user-cars/UserCars', [
            'cars' => $cars,
            'success' => session('success'),
            'selectedCompanyId' => $companyId,
            'hasVerifiedEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    }
    
    
    // 🔁 Shared sorting logic
    private function getUserCars($user,$currentPage,$companyId)
    {
        $carsQuery = Car::with([
            'images' => function ($query) {
                $query->select('car_id', 'image_path')->limit(1);
            },
            // Get the highest-rated review for each car
            'reviews' => function ($query) {
                $query->with('user') // Fetch user details for the top review
                      ->orderBy('rating', 'desc');// Sort by rating in descending orde // Limit to 1 review
            },
            'company' => function ($query) {
                $query->select('id', 'company_name', 'logo_path');
            },
        ])
        ->where('user_id', $user->id)
        ->select([
            'cars.id',
            'company_id',
            'year',
            'price',
            'rates',
            'brand',
            'model',
            'currency',
            'status',
            'created_at',
        ])
        ->addSelect([
            // Add review count directly in the query using selectRaw
            DB::raw('(SELECT COUNT(*) FROM reviews WHERE reviews.car_id = cars.id) as reviews_count')
        ])->orderBy('created_at', 'desc');

        if ($companyId) {

            $carsQuery->where('company_id',$companyId);
        }

        return $carsQuery->paginate(20, ['*'], 'page', $currentPage);

    }
    

    public function fetchReviews(Request $request, Car $car)
    {
        $reviews = $car->reviews()
            ->with('user')
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->orderBy('rating', 'desc')
            ->paginate(10);
    
        return response()->json([
            'reviews' => $reviews,
        ]);
    }
    
    public function setSession(Request $request)
{
    $request->validate([
        'car_id' => 'required|exists:cars,id',
    ]);

    session(['current_car_id' => $request->car_id]);

    return response()->json(['redirect' => route('cars.show')]);
}

}

