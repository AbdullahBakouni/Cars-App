<?php

namespace App\Http\Controllers;

use App\Http\Requests\CarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\Company;
use App\Models\Phone;
use App\Models\Review;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

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
    
            // ✅ معالجة الصور
            if ($request->hasFile('images')) {
                $images = [];
                foreach ($request->file('images') as $image) {
                    $originalPath = $image->store('temp_images', 'public');
                    $absolutePath = storage_path('app/public/' . $originalPath);
            
                    $newFileName = uniqid() . '.webp';
                    $compressedPath = 'car_images/' . $newFileName;
                    $destinationPath = storage_path('app/public/' . $compressedPath);
            
                    $this->resizeAndCompress($absolutePath, $destinationPath, 1280, 70, true);
                    unlink($absolutePath);
            
                    $images[] = ['car_id' => $car->id, 'image_path' => $compressedPath];
                }
                CarImage::insert($images);
            }
            
            
    
            // ✅ إنشاء الشركة إن كانت البيانات متوفرة
            if ($request->filled('company_name') || $request->hasFile('company_logo')) {
                $logoPath = null;
            
                // ⏳ معالجة الشعار إن وُجد
                if ($request->hasFile('company_logo')) {
                    $tempLogoPath = $request->file('company_logo')->store('temp_logos', 'public');
                    $absoluteLogoPath = storage_path('app/public/' . $tempLogoPath);
            
                    $newLogoName = uniqid() . '.webp';
                    $compressedLogoPath = 'logos/' . $newLogoName;
                    $destinationLogoPath = storage_path('app/public/' . $compressedLogoPath);
            
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
                } else {
                    // 🆕 إنشاء شركة جديدة
                    $company = Company::create([
                        'user_id' => $user->id,
                        'company_name' => $request->company_name,
                        'location' => $request->company_location,
                        'logo_path' => $logoPath,
                    ]);
            
                    $car->update(['company_id' => $company->id]);
                }
            }
            
    
            // ✅ حفظ الوسوم (Tags)
            if ($request->filled('tags')) {
                $tags = is_string($request->tags) ? explode(',', $request->tags) : $request->tags;
                $tagData = array_map(fn($tag) => ['name' => trim($tag), 'car_id' => $car->id], $tags);
                Tag::insert($tagData); // ✅ إدخال دفعة واحدة
            }
    
            DB::commit(); // ✅ تنفيذ جميع العمليات
    
            return redirect()->route('car.show', $car->id)->with("success", "Car created successfully.");
        } catch (\Exception $e) {
            DB::rollBack(); // ❌ إلغاء العمليات في حال حدوث خطأ
            return response()->json(['error' => 'Something went wrong: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * عرض سيارة معينة
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
    
            // 🚀 Optimized eager loading with selected columns only
            $car = Car::with(['images','company','user','reviews','company.reviews','reviews.user','phone'])->findOrFail($id);
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
    public function edit($id)
     {
        $car = Car::with(['images','company','tags'])->findOrFail($id);
        $user = Auth::user();
         return Inertia::render('Update-Cars/Update', ['car' => $car,
         'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
        ? $user->hasVerifiedEmail()
        : false,
        ]);
    }

    
    public function update(Request $request, $id)
    {
        $car = Car::findOrFail($id);
        $user = $car->user; // Get the user associated with the car
        $validated = $request->validate([
            'description' => 'required|string',
            'brand' => 'required|string',
            'model' => 'nullable|string',
            'year' => 'required|integer',
            'location' => 'nullable|string',
            'price' => 'nullable|string|min:1',
            'company_name' => [
                'nullable',
                'required_with:company_logo', // ✅ Ensures company_name is required if company_logo exists
                'string',
                'max:255'
            ],
            'company_location' => [
                'nullable',
                'required_with:company_logo', // ✅ Ensures company_location is required if company_logo exists
                'string',
                'max:255'
            ],
            'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'body_type' => 'nullable|string',
            'mileage' => 'nullable|string',
            'currency' => 'nullable|string',
            'status' => 'nullable|string',
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
        // Update or create company
        if ($request->filled('company_name') || $request->filled('company_location') || $request->hasFile('company_logo')) {
            if ($car->company->id !== null) {
                // Handle company logo upload before updating
                if ($request->hasFile('company_logo')) {
                    if ($car->company->logo_path) {
                        Storage::disk('public')->delete($car->company->logo_path);
                    }
            
                    $logoPath = $request->file('company_logo')->store('logos', 'public');
                } else {
                    $logoPath = $car->company->logo_path; // Keep the old logo if no new file is uploaded
                }
            
                // Update existing company
                $car->company->update([
                    'company_name' => $validated['company_name'] ?? $car->company->company_name,
                    'location' => $validated['company_location'] ?? $car->company->location,
                    'logo_path' => $logoPath,
                ]);
            } else {
                // Handle company logo upload if creating a new company
                $logoPath = null;
                if ($request->hasFile('company_logo')) {
                    $logoPath = $request->file('company_logo')->store('logos', 'public');
                }
            
                // Create a new company
                $company = Company::create([
                    'user_id' => $user->id, // Associate with the user
                    'company_name' => $validated['company_name'],
                    'location' => $validated['company_location'],
                    'logo_path' => $logoPath,
                ]);
            
                // Attach the company to the car
                $car->company_id = $company->id;
                $car->save(); 
            }
        }
    
        // Update the car fields (excluding phone & WhatsApp)
        $car->update(collect($validated)->except(['company_name', 'company_location', 'company_logo','tags','removed_tags'])->toArray());
    
        // Handle company logo upload
        if ($request->hasFile('company_logo')) {
            if ($car->company && $car->company->logo_path) {
                Storage::disk('public')->delete($car->company->logo_path);
            }
            
            $path = $request->file('company_logo')->store('logos', 'public');
    
            if ($car->company) {
                $car->company->update(['logo_path' => $path]);
            }
        }
    
        // Handle new images
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $image) {
                $path = $image->store('car_images', 'public');
                $car->images()->create(['image_path' => $path]);
            }
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
    public function destroy(Car $car)
    {
        // Ensure images relationship is loaded
        $car->load('images');
    
        // Delete images from storage and database
        foreach ($car->images ?? [] as $image) {
            // Construct the full path
            $imagePath = 'car_images/' . $image->image_path;
    
            // Check if the file exists before deleting
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
    
            // Delete image record from database
            $image->delete();
        }
    
        // Delete the car record
            $car->delete();
    
            session()->flash("success","Car was deleted successfully");
        // Redirect with success message, updated cars, and email verification status
            return redirect()->route('cars.my'); 
            
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


    public function getCarsByBodyType(Request $request)
    {
        $user = Auth::user();
        $bodyTypeId = $request->query('body_type');
        $brandName = $request->query('brand_name');
        $modelName = $request->query('model_name');
        $sortBy = $request->query('sort', 'posted');
        $price = $request->query('maxPrice');
        $currency = $request->query('currency');
        $categoryName = $request->query('category');
    
        // 🧠 الحقول الأساسية المطلوبة
        $selectFields = ['id', 'brand', 'model', 'year', 'mileage', 'description', 'rates', 'price', 'currency', 'status'];
    
        // 🧠 الفئات التي تتطلب cylinders
        $categoriesRequiringCylinders = ['Elecrtic', 'Sport', 'SuperCars', 'Adventure'];
        if (in_array($categoryName, $categoriesRequiringCylinders)) {
            $selectFields[] = 'cylinders';
        }
    
        // 🧱 الاستعلام الأساسي
        $query = Car::select($selectFields)
            ->with([
                'images' => fn($q) => $q->select('car_id', 'image_path')->limit(1),
                'tags',
                'company'
            ]);
    
        // 🎯 ترتيب النتائج
        match ($sortBy) {
            'price-low'    => $query->orderBy('price', 'asc'),
            'price-high'   => $query->orderBy('price', 'desc'),
            'year-new'     => $query->orderBy('year', 'desc'),
            'year-old'     => $query->orderBy('year', 'asc'),
            'mileage-low'  => $query->orderBy('mileage', 'asc'),
            'mileage-high' => $query->orderBy('mileage', 'desc'),
            default        => $query->orderBy('created_at', 'desc'),
        };
    
        // 🧩 فلاتر إضافية
        if ($bodyTypeId) {
            $query->where('body_type', $bodyTypeId);
        }
    
        if ($brandName) {
            $query->where('brand', $brandName);
        }
    
        if ($brandName && $modelName) {
            $query->where('model', $modelName);
        }
    
        if ($request->has('currency') && in_array($currency, ['SYP', 'USD'])) {
            $query->where('currency', $currency);
        }
    
        // 🎯 فلترة حسب الفئة
        match ($categoryName) {
            'Economy' => $query->where(function ($q) {
                $q->where('currency', 'SYP')->whereBetween('price', [20_000_000, 60_000_000]);
            })->orWhere(function ($q) {
                $q->where('currency', 'USD')->whereBetween('price', [2_000, 6_000]);
            }),
        
            'Family' => $query->where('body_type', 'suv')->whereIn('doors', [4, 5]),
        
            'Elecrtic' => $query->where(function ($q) {
                $q->where('cylinders', 'Electric');
            }),
        
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
        
        // 💰 فلترة بالسعر فقط إذا ما في فلاتر أخرى
        if (!$brandName && !$modelName && !$bodyTypeId && $price !== null) {
            if (!is_numeric($price)) {
                return back()->withErrors(['price' => 'يجب إدخال سعر صحيح.']);
            }
    
            $price = (float) $price;
    
            $cars = Car::select($selectFields)
            ->when($currency === 'SYP', function ($query) use ($price) {
                // إذا كانت العملة SYP، إضافة أو خصم 10,000,000
                $query->whereBetween('price', [$price - 10000000, $price + 10000000]);
            })
            ->when($currency === 'USD', function ($query) use ($price) {
                // إذا كانت العملة USD، إضافة أو خصم 1000
                $query->whereBetween('price', [$price - 1000, $price + 1000]);
            })
            ->where('currency', $currency)
            ->orderByRaw("ABS(price - ?)", [$price])
            ->with([
                'images' => fn($q) => $q->select('car_id', 'image_path')->limit(1),
                'tags'
            ])->paginate(40);
               
        } else {
            $cars = $query->paginate(40);
        }
    
        return Inertia::render('cars/CarSearchResults', [
            'cars' => $cars,
            'totalResults' => $cars->total(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
            'filters' => [
                'bodyTypeId' => $bodyTypeId,
                'brandName' => $brandName,
                'modelName' => $modelName,
                'sortBy' => $sortBy,
                'price' => $price,
                'categoryName' => $categoryName,
            ],
        ]);
    }
    

    

    public function myCars(Request $request)
    {
        $user = Auth::user();
    
        // Get sort option from the request (default to 'default' if not provided)
        $sortOption = $request->query('sort', 'default');
        $currentPage = $request->input('page', 1);
        // Handle car status update if needed
        if ($request->has('status') && $request->has('car_id')) {
            $request->validate([
                'status' => 'required|string|in:sell,rent,rented,sold',
            ]);
    
            // Find the car and update the status
            $car = Car::where('user_id', $user->id)->findOrFail($request->car_id);
            $car->status = $request->status;
            $car->save();
    
            // After updating, fetch the cars again with the same sorting
            $cars = $this->getUserCars($user, $sortOption,$currentPage);
    

            // Return the updated cars and other relevant info
            return Inertia::render('user-cars/UserCars', [
                'cars' => $cars,
                'success' => "Car status has been updated successfully.",
                'sortOption' => $sortOption,
                'hasVerifiedEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                    ? $user->hasVerifiedEmail()
                    : false,
            ]);
        }
    
        // Fetch cars with sorting and pagination
        $cars = $this->getUserCars($user, $sortOption,$currentPage);
    
        // Return the cars with other relevant info
        return Inertia::render('user-cars/UserCars', [
            'cars' => $cars,
            'success' => session('success'),
            'sortOption' => $sortOption,
            'hasVerifiedEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    }
    
    
    // 🔁 Shared sorting logic
    private function getUserCars($user, $sortOption,$currentPage)
    {
        $carsQuery = Car::with([
            'images' => function ($query) {
                $query->select('car_id', 'image_path')->limit(1);
            },
            // Get the highest-rated review for each car
            'reviews' => function ($query) {
                $query->with('user') // Fetch user details for the top review
                      ->orderBy('rating', 'desc') // Sort by rating in descending order
                      ->limit(1); // Limit to 1 review
            }
        ])
        ->where('user_id', $user->id)
        ->select([
            'cars.id',
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
        ]);
    
        // Apply sorting based on the selected option
        switch ($sortOption) {
            case 'price-low-to-high':
                $carsQuery->orderBy('price', 'asc');
                break;
            case 'price-high-to-low':
                $carsQuery->orderBy('price', 'desc');
                break;
            case 'rating-high-to-low':
                $carsQuery->orderBy('rates', 'desc');
                break;
            case 'rating-low-to-high':
                $carsQuery->withAvg('reviews', 'rating')->orderBy('rates', 'asc');
                break;
            default:
                $carsQuery->orderBy('created_at', 'desc');
                break;
        }
    
        return $carsQuery->paginate(20);
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
    
}

