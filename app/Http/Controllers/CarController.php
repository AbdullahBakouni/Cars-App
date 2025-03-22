<?php

namespace App\Http\Controllers;

use App\Http\Requests\CarRequest;
use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\Company;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
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
            $data = $request->except(['images', 'company_name', 'company_logo','tags',"phone","whatsapp"]); 
          
            // Get the authenticated user
            $user = Auth::user();
        
            // Check if user is an instance of the User model
            if (!$user instanceof User) {
                return response()->json(['error' => 'User is not authenticated'], 401);
            }
        
        
            if ($request->has('phone')) {
                $user->phone = $request->phone; // Assign the phone number
            }
            
            if ($request->has('whatsapp')) {
                $user->whatsapp = $request->whatsapp; // Assign the whatsapp number
            }
            
            // Save the updated user data
            $user->save();
            
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
        
            // Handle company logo (if present)
            if (($request->has('company_name') && !empty($request->company_name)) || ($request->hasFile('company_logo') && $request->file('company_logo') !== null)) {
                // Store the company logo if uploaded
                $logoPath = null;
                if ($request->hasFile('company_logo')) {
                    $logoPath = $request->file('company_logo')->store('logos', 'public');
                }
            
                // Create a new company even if the user already has one
                $company = Company::create([
                    'user_id' => $user->id,
                    'company_name' => $request->company_name ?? 'Default Company', // Default if company_name is not provided
                    'logo_path' => $logoPath,
                ]);
            
                // Assign the new company ID to the car being created (if needed)
                $data['company_id'] = $company->id;
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
        
            return redirect("/")->with("success", "Car created successfully.");
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong: ' . $e->getMessage()], 500);
        }
        
    }
    
    


    /**
     * عرض سيارة معينة
     */
    public function show(Car $car)
    {
        return new CarResource($car->load(['user', 'company', 'images']));
    }

    /**
     * تحديث بيانات السيارة
     */
    public function update(CarRequest $request, Car $car)
    {
        $validated = $request->validated();
        $car->update($validated);

        // تحديث الصور إن وجدت
        if ($request->hasFile('images')) {
            // حذف الصور القديمة
            foreach ($car->images as $image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }

            // رفع الصور الجديدة
            foreach ($request->file('images') as $image) {
                $path = $image->store('car_images', 'public');
                CarImage::create([
                    'car_id' => $car->id,
                    'image_path' => $path,
                ]);
            }
        }

        return new CarResource($car->load(['user', 'company', 'images']));
    }

    /**
     * حذف سيارة
     */
    public function destroy(Car $car)
    {
        // حذف الصور المرتبطة
        foreach ($car->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $car->delete();
        return response()->json(['message' => 'تم حذف السيارة بنجاح'], 200);
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




// public function getCarsByBodyType(Request $request)
// {
//     $user = Auth::user();
//     $bodyTypeId = $request->query('body_type');
//     $sortBy = $request->query('sort', 'posted');

//     $query = Car::with(['images', 'tags']);

//     if ($bodyTypeId) {
//         $query->where('body_type', $bodyTypeId);
//     }

//     // Fetch cars with sorting
//     // $query = Car::with(['images', 'tags'])->where('body_type', $bodyTypeId);

//     switch ($sortBy) {
//         case 'price-low': $query->orderBy('price', 'asc'); break;
//         case 'price-high': $query->orderBy('price', 'desc'); break;
//         case 'year-new': $query->orderBy('year', 'desc'); break;
//         case 'year-old': $query->orderBy('year', 'asc'); break;
//         case 'mileage-low': $query->orderBy('mileage', 'asc'); break;
//         case 'mileage-high': $query->orderBy('mileage', 'desc'); break;
//         default: $query->latest(); break;
//     }

//     $cars = $query->get();

//     return Inertia::render('car_body_type/CarsByBodyType', [
//         'cars' => $cars,
//         'totalResults' => $cars->count(),
//         'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
//             ? $user->hasVerifiedEmail()
//             : false,
//     ]);
// }
public function getCarsByBodyType(Request $request)
{
    $user = Auth::user();
    $bodyTypeId = $request->query('body_type');
    $brandName = $request->query('brand_name');
    $modelName = $request->query('model_name');
    $sortBy = $request->query('sort', 'posted'); // Get sort option, default to 'posted'

    // Fetch cars with sorting
    $query = Car::with(['images', 'tags']);

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
    // Dynamic view rendering based on request parameters
    if ($bodyTypeId) {
        // If body_type exists, filter by body_type
        $query->where('body_type', $bodyTypeId);
        $cars = $query->get();
        return Inertia::render('car_body_type/CarsByBodyType', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    } elseif ($brandName && !$modelName) {
        // If only brand_name exists, fetch all models for that brand
         $query->where('brand', $brandName)->distinct()->pluck('model');
         $cars = $query->get();
        return Inertia::render('car_by_all-models/CarBrandModel', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    } elseif ($brandName && $modelName) {
        // If both brand_name and model_name exist, filter by brand and model
         $query->where('brand', $brandName)->where('model', $modelName)->get();
         $cars = $query->get();
        return Inertia::render('car_by_model/CarModel', [
            'cars' => $cars,
            'totalResults' => $cars->count(),
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    }

    // Default fallback if none of the conditions match
    // return redirect()->route('/'); // Or return a default view if needed
}


public function getAllModelsByBrand($brand_name)
{
    // Fetch all distinct car models for the selected brand
    $cars = Car::where('brand', $brand_name)
               ->with(['images', 'tags']) // Eager load the images and tags
               ->get();

    $user = Auth::user();
    // If no cars are found, handle it as needed (e.g., show a message)

    // Return the data to the Inertia page
    return inertia::render('car_by_all-models/CarBrandModel', [
        'cars' => $cars,
        'totalResults' => $cars->count(),
        'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
        ? $user->hasVerifiedEmail()
        : false,
    ]);
}





public function getCarsByBrandModel($brand_name, $model_name)
{
    // Fetch cars for the selected brand and model, eager load images and tags
    $cars = Car::where('brand', $brand_name)
               ->where('model', $model_name)
               ->with(['images', 'tags']) // Eager load images and tags
               ->get();
               
    $user = Auth::user();
    // If no cars are found, handle it as needed (e.g., show a message or a default view)

    return inertia::render('car_by_model/CarModel', [
        'cars' => $cars,
        'totalResults' => $cars->count(),
        'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
        ? $user->hasVerifiedEmail()
        : false,
    ]);
}

}

