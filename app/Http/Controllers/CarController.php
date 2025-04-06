<?php

namespace App\Http\Controllers;

use App\Http\Requests\CarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\Company;
use App\Models\Phone;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CarController extends Controller
{
    /**
     * عرض جميع السيارات
     */
    public function index()
    {
        $cars = Car::with(['user', 'company', 'images'])->paginate(10);
        return CarResource::collection($cars);
    }

    /**
     * إنشاء سيارة جديدة
     */
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
                    $path = $image->store('car_images', 'public');
                    $images[] = ['car_id' => $car->id, 'image_path' => $path];
                }
                CarImage::insert($images); // ✅ إدخال دفعة واحدة لتحسين الأداء
            }
    
            // ✅ إنشاء الشركة إن كانت البيانات متوفرة
            if ($request->filled('company_name') || $request->hasFile('company_logo')) {
                $logoPath = $request->hasFile('company_logo') ? $request->file('company_logo')->store('logos', 'public') : null;
                $company = Company::firstOrCreate(
                    ['user_id' => $user->id, 'company_name' => $request->company_name],
                    ['logo_path' => $logoPath, 'location' => $request->company_location]
                );
                $car->update(['company_id' => $company->id]);
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
            $reviewsByUser = $car->reviews->groupBy('user_id');
    
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
                'reviewsByUser' => $reviewsByUser,
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
    $sortBy = $request->query('sort', 'posted'); // Default sorting by 'posted'
    $price = $request->query('maxPrice');
    $currency = $request->query('currency');
    $categoryName = $request->query('category');
    $currentPage = $request->query('page', 1); // الفئة المختارة

    // بناء الاستعلام الأساسي مع العلاقات المطلوبة
    $query = Car::select('id', 'brand', 'model', 'year', 'mileage', 'description', 'rates', 'price','currency','status')
    ->with(['images' => function ($query) {
        $query->select('car_id', 'image_path')->limit(1); // Limit to the first image
    }, 'tags', 'company']);

    switch ($sortBy) {
        case 'price-low':
            $query->orderBy('price', 'asc');
            break;
        case 'price-high':
            $query->orderBy('price', 'desc');
            break;
        case 'year-new':
            $query->orderBy('year', 'desc');
            break;
        case 'year-old':
            $query->orderBy('year', 'asc');
            break;
        case 'mileage-low':
            $query->orderBy('mileage', 'asc');
            break;
        case 'mileage-high':
            $query->orderBy('mileage', 'desc');
            break;
        default:
            $query->orderBy('created_at', 'desc');// Default sorting by the latest
            break;
    }

    // 🔹 تصفية حسب نوع الجسم
    if ($bodyTypeId) {
        $query->where('body_type', $bodyTypeId);
    }

    // 🔹 تصفية حسب العلامة التجارية والموديل
    if ($brandName) {
        $query->where('brand', $brandName);
    }
    if ($brandName && $modelName) {
        $query->where('model', $modelName);
    }

    // 🔹 تصفية حسب الفئة المختارة
    if ($categoryName === "Economy") {
        $query->where(function ($query) {
            $query->where('currency', 'SYP')
                  ->where('price', '<=', 50000000);
        })
        ->orWhere(function ($query) {
            $query->where('currency', 'USD')
                  ->whereBetween('price', [2000, 5000]);
        });
    } elseif ($categoryName === "Family") {
        $query->where('body_type', 'suv')
              ->whereIn('doors', [4, 5]);
    } elseif ($categoryName === "Electric") {
        $query->where('cylinders', 'Electric');
    } elseif ($categoryName === "Luxury") {
        $query->where('body_type', 'sedan')
              ->where(function ($query) {
                  $query->where('currency', 'SYP')
                        ->whereBetween('price', [800000000, 1200000000]);
              })
              ->orWhere(function ($query) {
                  $query->where('currency', 'USD')
                        ->whereBetween('price', [180000, 220000]);
              });
    } elseif ($categoryName === "Sport") {
        $query->where('body_type', 'coupe')
              ->whereIn('cylinders', [6, 8, 10])
              ->where(function ($query) {
                  $query->where('currency', 'SYP')
                        ->whereBetween('price', [400000000, 600000000]);
              })
              ->orWhere(function ($query) {
                  $query->where('currency', 'USD')
                        ->whereBetween('price', [490000, 510000]);
              });
    } elseif ($categoryName === "SuperCars") {
        $query->where('body_type', 'coupe')
              ->whereIn('cylinders', [10, 12, 16])
              ->where(function ($query) {
                  $query->where('currency', 'SYP')
                        ->whereBetween('price', [800000000, 1200000000]);
              })
              ->orWhere(function ($query) {
                  $query->where('currency', 'USD')
                        ->whereBetween('price', [180000, 220000]);
              });
    } elseif ($categoryName === "Adventure") {
        $query->where('body_type', 'suv')
              ->whereIn('cylinders', [6, 8])
              ->where(function ($query) {
                  $query->where('currency', 'SYP')
                        ->whereBetween('price', [300000000, 500000000]);
              })
              ->orWhere(function ($query) {
                  $query->where('currency', 'USD')
                        ->whereBetween('price', [60000, 80000]);
              });
    } elseif ($categoryName === "Utility") {
        $query->where(function ($query) {
            $query->where('body_type', 'minivan')
                  ->orWhere('body_type', 'pickup');
        });
    }

    // 🔹 تصفية حسب السعر (عند عدم وجود فلتر آخر)
    if (!$brandName && !$modelName && !$bodyTypeId && $price !== null) {
        if (!is_numeric($price)) {
            return back()->withErrors(['price' => 'يجب إدخال سعر صحيح.']);
        }
        $price = (float) $price;

        // البحث عن السيارات بناءً على السعر القريب
        $cars = Car::select('id', 'brand', 'model', 'year', 'mileage', 'description', 'rates', 'price','currency','status')
        ->whereBetween('price', [$price - 500, $price + 500])
        ->where('currency', $currency) // Filter by currency
        ->orderByRaw("ABS(price - ?)", [$price]) // Sort by closest price
        ->with(['images' => function ($query) {
            $query->select('car_id', 'image_path')->limit(1); // Limit to the first image only
        }, 'tags']) // Load images and tags
        ->paginate(40);
    
    } else {
        // تنفيذ الاستعلام العادي مع التصفية وتطبيق التصفح
        $cars = $query->paginate(40);
    }

    // 🔹 إرسال البيانات إلى صفحة واحدة مع الحفاظ على الفلاتر
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
    
        // Get the current page from the request (default to page 1 if not provided)
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
            $cars = $this->getUserCars($user, $sortOption, $currentPage);
    
            // Return the updated cars and other relevant info
            return Inertia::render('user-cars/UserCars', [
                'cars' => $cars,
                'success' => "Car status updated",
                'sortOption' => $sortOption,
                'hasVerifiedEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                    ? $user->hasVerifiedEmail()
                    : false,
            ]);
        }
    
        // Fetch cars with sorting and pagination
        $cars = $this->getUserCars($user, $sortOption, $currentPage);
    
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
    private function getUserCars($user, $sortOption, $currentPage)
    {
        $carsQuery = Car::with(['images' => function ($query) {
            $query->select('car_id', 'image_path')->limit(1);
        }, 'reviews', 'reviews.user'])
        ->where('user_id', $user->id)
        ->select(['id', 'year', 'price', 'rates', 'brand', 'model', 'currency', 'status','created_at']);
    
        // Apply sorting
        switch ($sortOption) {
            case 'price-low-to-high':
                $carsQuery->orderBy('price', 'asc');
                break;
            case 'price-high-to-low':
                $carsQuery->orderBy('price', 'desc');
                break;
            case 'rating-high-to-low':
                $carsQuery->withAvg('reviews', 'rating')->orderBy('reviews_avg_rating', 'desc');
                break;
            case 'rating-low-to-high':
                $carsQuery->withAvg('reviews', 'rating')->orderBy('reviews_avg_rating', 'asc');
                break;
            default:
                $carsQuery->orderBy('created_at', 'desc');
                break;
        }
    
        // Apply pagination
        return $carsQuery->paginate(20);  // Adjust the number of cars per page if needed
    }
    
    
}

