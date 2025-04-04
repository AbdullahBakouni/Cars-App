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
            // Exclude unnecessary fields for the car creation
            $validatedData = $request->validated();
            $data = Arr::except($validatedData, ['images', 'company_name', 'company_logo', 'tags', 'phone', 'company_location']);
            if ($request->has('price')) {
                $data['price'] = (float) $request->price;  // Ensure price is an float
            }
            // Get the authenticated user
            $user = Auth::user();
        
            if (!$user instanceof User) {
                return response()->json(['error' => 'User is not authenticated'], 401);
            }
    
            // Create the car
            if ($request->has('phone') && !empty($request->phone)) {
                // Remove non-numeric characters
                $normalizedPhone = preg_replace('/\D/', '', $request->phone);  // Remove anything non-numeric
              // You can remove this line later, it's for debugging
                
                $normalizedPhone = preg_replace('/\D/', '', $request->phone);  // Remove anything non-numeric
    
    // Case 1: If the phone starts with 09 and is 10 digits long
            if (substr($normalizedPhone, 0, 2) === '09' && strlen($normalizedPhone) === 10) {
                // If the number starts with 09, replace it with +963
                $normalizedPhone = '+963 ' . substr($normalizedPhone, 1);  // Replace 0 with +963
            } 
            // Case 2: If the phone starts with 963 and is 11 digits long (already normalized without the +)
            elseif (substr($normalizedPhone, 0, 3) === '963' && strlen($normalizedPhone) === 12) {
                // If the number starts with 963, add +963 to the front and format it
                $normalizedPhone = '+963 ' . substr($normalizedPhone, 3);  // Keep +963 and add the remaining digits
            } 
     else {
        return response()->json(['error' => 'Invalid phone number format. It should start with +963 or 09.'], 400);
    }
            
                // Check if the phone already exists for the user
                $phone = $user->phones()->where('number', $normalizedPhone)->first();
            
                if (!$phone) {
                    // If the phone doesn't exist, create a new phone entry
                    $phone = $user->phones()->create([
                        'number' => $normalizedPhone,
                    ]);
                }
            
                // Associate the car with the phone
                $data['phone_id'] = $phone->id;
            }
            


            $car = $user->cars()->create($data);
            
    
            // Handle images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('car_images', 'public');
                    CarImage::create([
                        'car_id' => $car->id,
                        'image_path' => $path,
                    ]);
                }
            }
    
            // Handle company details
            if (($request->has('company_name') && !empty($request->company_name)) || ($request->hasFile('company_logo') && $request->file('company_logo') !== null)) {
                $logoPath = null;
                if ($request->hasFile('company_logo')) {
                    $logoPath = $request->file('company_logo')->store('logos', 'public');
                }
            
                $company = Company::create([
                    'user_id' => $user->id,
                    'company_name' => $request->company_name ?? 'Default Company',
                    'logo_path' => $logoPath,
                    'location' => $request->company_location,
                ]);
            
                $car->company_id = $company->id;
                $car->save(); 
            }
    
            // Save tags
            if ($request->has('tags')) {
                $tags = is_string($request->tags) ? explode(',', $request->tags) : $request->tags;
                foreach ($tags as $tagName) {
                    Tag::create([
                        'name' => trim($tagName),
                        'car_id' => $car->id
                    ]);
                }
            }
    
            return redirect()->route('car.show', $car->id)->with("success", "Car created successfully.");
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong: ' . $e->getMessage()], 500);
        }
    }
    
    
    


    /**
     * عرض سيارة معينة
     */
    public function show($id)
    {
        try {
            // Retrieve the car with related data
            $car = Car::with(['images','company','user','reviews','company.reviews','reviews.user','phone'])->findOrFail($id);
            $user = Auth::user();
            $reviewsByUser = $car->reviews->groupBy('user_id');
              // Get the price of the car (in the same currency as the suggested cars)
                    $carPrice = $car->price;
                    $carCurrency = $car->currency;
                    // Calculate a price tolerance for similar price (e.g., within 10% of the car's price)
                    $priceTolerance = 0.1 * $carPrice;  // Adjust tolerance as needed
                    $minPrice = $carPrice - $priceTolerance;
                    $maxPrice = $carPrice + $priceTolerance;

                    // Get suggested cars based on body type, model, cylinders, and close price range (same model, body type, cylinders)
                    $suggestedCarsQuery = Car::with(['images','tags'])->where('body_type', $car->body_type)
                                            ->where('model', $car->model)
                                            ->where('brand', $car->brand)
                                            ->where('year', $car->year)
                                            ->where('cylinders', $car->cylinders)
                                            ->where('id', '!=', $car->id)  // Exclude the current car
                                            ->limit(5);  // Limit to 5 suggested cars

                    // Only filter by price if the currencies match
                    if ($carCurrency) {
                        $suggestedCarsQuery->where('currency', $carCurrency)  // Ensure the car and suggested car are in the same currency
                                        ->whereBetween('price', [$minPrice, $maxPrice]);  // Filter price within the tolerance range
                    }

                    // Retrieve the suggested cars
                    $suggestedCars = $suggestedCarsQuery->get();

            // Return an Inertia response
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
            return redirect()->route('cars.my'); // Assuming you have a route like this
            // ->with('cars', Car::with(['images','reviews', 'reviews.user'])->where('user_id', $user->id)->get())
            // ->with('successdeleted', $successdeleted)
            // ->with('hasVerifiedEmail', $hasVerifiedEmail); // Pass the email verification status
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
    $categoryName = $request->query('category'); // الفئة المختارة

    // بناء الاستعلام الأساسي مع العلاقات المطلوبة
    $query = Car::with(['images', 'tags','company']);

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
                    $query->latest(); // Default sorting by the latest
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
    } elseif ($categoryName === "Elecrtic") {
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
        $cars = Car::whereBetween('price', [$price - 500, $price + 500])
            ->where('currency', $currency) // Filter by currency
            ->orderByRaw("ABS(price - ?)", [$price]) // ترتيب حسب أقرب سعر
            ->with(['images', 'tags']) // جلب الصور والعلامات
            ->get();
    } else {
        // تنفيذ الاستعلام العادي عند عدم وجود فلتر للسعر فقط
        $cars = $query->get();
    }

    // 🔹 إرسال البيانات إلى صفحة واحدة فقط
    return Inertia::render('cars/CarSearchResults', [
        'cars' => $cars,
        'totalResults' => $cars->count(),
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

public function searchByPrice(Request $request)
{
    $price = $request->query('maxPrice');
    $user = Auth::user();
    // تأكد من أن السعر مدخل كرقم صحيح وإلا استخدم قيمة افتراضية
    if (!is_numeric($price)) {
        return back()->withErrors(['price' => 'يجب إدخال سعر صحيح.']);
    }

    $price = (float) $price; // تحويل إلى رقم عشري لضمان صحة الحسابات

    // البحث عن السيارات بالسعر المحدد أو الأقرب إليه
    $cars = Car::whereBetween('price', [$price - 500, $price + 500])
        ->orderByRaw("ABS(price - ?)", [$price]) // استخدام binding لمنع الأخطاء
        ->limit(10)
        ->with(['images', 'tags']) // جلب الصور والعلامات
        ->get();

    return Inertia::render('Cars_By_Price/SearchResults', ['cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
]);
}


public function filter(Request $request)
{
    $user = Auth::user();
    $categoryName = $request->query('category');
    
    // Start the car query with eager loading for images and tags
    $query = Car::with(['images', 'tags']);
    
    // Apply filters based on the selected category
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
    } elseif ($categoryName === "Elecrtic") {
        $query->where('cylinders', 'Electric');
    } elseif ($categoryName === "Luxury") {
        $query->where('body_type', 'sedan');
        $query->where(function ($query) {
            $query->where('currency', 'SYP')
                  ->whereBetween('price', [800000000, 1200000000]);
        })
        ->orWhere(function ($query) {
            $query->where('currency', 'USD')
                  ->whereBetween('price', [180000, 220000]);
        });
    } elseif ($categoryName === "Sport") {
        $query->where('body_type', 'coupe')
              ->whereIn('cylinders', [6, 8, 10]);
        $query->where(function ($query) {
            $query->where('currency', 'SYP')
                  ->whereBetween('price', [400000000, 600000000]);
        })
        ->orWhere(function ($query) {
            $query->where('currency', 'USD')
                  ->whereBetween('price', [490000, 510000]);
        });
    } elseif ($categoryName === "SuperCars") {
        $query->where('body_type', 'coupe')
              ->whereIn('cylinders', [10, 12 , 16]);
        $query->where(function ($query) {
            $query->where('currency', 'SYP')
                  ->whereBetween('price', [800000000, 1200000000]);
        })
        ->orWhere(function ($query) {
            $query->where('currency', 'USD')
                  ->whereBetween('price', [180000, 220000]);
        });
    } elseif ($categoryName === "Adventure") {
        $query->where('body_type', 'suv')
              ->whereIn('cylinders', [6, 8]);
        $query->where(function ($query) {
            $query->where('currency', 'SYP')
                  ->whereBetween('price', [300000000, 500000000]);
        })
        ->orWhere(function ($query) {
            $query->where('currency', 'USD')
                  ->whereBetween('price', [60000, 80000]);
        });
    } elseif ($categoryName === "Utility") {
        $query->where('body_type', 'minivan');
        $query->where('body_type', 'pickup');
    }

    // Get the cars based on the applied filters
    $cars = $query->get();

    // Return the filtered cars based on the category
    if ($categoryName === "Economy") {
        return Inertia::render('economy-cars/Economy', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    }
        elseif ($categoryName === "Family") {
        return Inertia::render('family-cars/Family', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    } elseif ($categoryName === "Elecrtic") {
        return Inertia::render('electric-cars/Electric', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    } elseif ($categoryName === "Luxury") {
        return Inertia::render('luxury-cars/Luxury', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    } elseif ($categoryName === "Sport") {
        return Inertia::render('sport-cars/Sport', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    } elseif ($categoryName === "SuperCars") {
        return Inertia::render('super-cars/SuperCars', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    } elseif ($categoryName === "Adventure") {
        return Inertia::render('adventure-cars/Adventure', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    } elseif ($categoryName === "Utility") {
        return Inertia::render('utility-cars/Utility', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    }

    // Default page (in case category doesn't match)
    return redirect("/");
}
public function myCars(Request $request)
{
    $user = Auth::user();
    $cars = Car::with(['images','reviews', 'reviews.user'])
        ->where('user_id', $user->id)
        ->get();

    // Check if there's a status update request
    if ($request->has('status') && $request->has('car_id')) {
        // Validate the status
        $request->validate([
            'status' => 'required|string|in:sell,rent,rented,sold',
        ]);

        // Find the car by ID
        $car = Car::findOrFail($request->car_id);
            // Otherwise, update the status
            $car->status = $request->status;
            $car->save();

        // Return the updated cars list with success message
        return Inertia::render('user-cars/UserCars', [
            'cars' => Car::with(['images','reviews', 'reviews.user'])->where('user_id', $user->id)->get(),
            'success' => "Car status updated",
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    }

    // Return the cars without any update
    return Inertia::render('user-cars/UserCars', [
        'cars' => $cars,
        'success' => session('success'),
        'hasVerifiedEmail' =>$user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
        ? $user->hasVerifiedEmail()
        : false,
    ]);
}




// public function updateStatus(Request $request, Car $car)
// {
//     $request->validate([
//         'status' => 'required|string|in:sell,rent',
//     ]);

//     $car->status = $request->status;
//     $car->save();

//     return Inertia::render('user-cars/UserCars', [
//         'success' => "Car status updated from",
//     ]);
// }

}

