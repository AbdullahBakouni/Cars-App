<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */

     
    public function setSession(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:company,id',
        ]);
    
        session(['current_company_id' => $request->company_id]);
    
        return response()->json(['redirect' => route('companies.show')]);
    }
    public function show(Request $request)
{
    $companyId = session()->get('current_company_id');
    $company = Company::with([
        'user.phones' => function ($query) {
            $query->select('user_id', 'number');
        },
        'reviews.user',
        'user',
        'reviews'
    ])->findOrFail($companyId);
    $carsQuery = Car::select('id', 'year', 'price', 'rates', 'brand', 'model', 'description', 'mileage', 'currency', 'company_id', 'created_at')
        ->where('company_id', $company->id)
        ->with([
            'images' => function ($query) {
                $query->select('id', 'car_id', 'image_path')->limit(1);
            }
        ]);

  

    $paginatedCars = $carsQuery->paginate(10)->withQueryString();
    $user = Auth::user();

    return Inertia::render('company/CompanyDetails', [
        'company' => $company,
        'cars' => $paginatedCars, // Full paginator object
        'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
            ? $user->hasVerifiedEmail()
            : false,
    ]);
}

    

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */

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
public function update(Request $request, Company $company)
{
    $request->validate([
        'company_name' => 'nullable|string|max:255',
        'location' => 'nullable|string|max:255',
        'company_logo' => 'required|image|max:2048',
        'deleted_logo' => 'nullable|boolean',
        'page' => 'nullable|integer'
    ]);

    $oldHash = null;

    // إذا طلب المستخدم حذف الشعار
    if ($request->boolean('deleted_logo')) {
        if ($company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
            // احفظ الهاش قبل الحذف
            $oldHash = md5(Storage::disk('public')->get($company->logo_path));
            Storage::disk('public')->delete($company->logo_path);
        }
        $company->logo_path = null;
    }

    // إذا تم رفع شعار جديد
    if ($request->hasFile('company_logo')) {
        $newImage = $request->file('company_logo');
        $newHash = md5_file($newImage->getRealPath());

        // إذا ما حذف الشعار، احسب الهاش القديم الآن
        if (!$oldHash && $company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
            $oldHash = md5(Storage::disk('public')->get($company->logo_path));
        }

        // إذا الشعار الجديد يختلف عن القديم
        if ($newHash !== $oldHash) {
            if ($company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
                Storage::disk('public')->delete($company->logo_path);
            }

            // ضغط وتخزين الصورة الجديدة
            $tempLogoPath = $newImage->store('temp_logos', 'public');
            $absoluteLogoPath = storage_path('app/public/' . $tempLogoPath);

            $newLogoName = uniqid() . '.webp';
            $compressedLogoPath = 'logos/' . $newLogoName;
            $destinationLogoPath = storage_path('app/public/' . $compressedLogoPath);

            $this->resizeAndCompress($absoluteLogoPath, $destinationLogoPath, 512, 80, true);
            unlink($absoluteLogoPath);

            $company->logo_path = $compressedLogoPath;
        }
    }

    // تحديث باقي بيانات الشركة
    $company->company_name = $request->company_name;
    $company->location = $request->location;
    $company->save();

    session()->flash("success","Company was Updtaed successfully");
    return redirect()->route('company.my', ['page' => $request->input('page', 1)]);


}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Company $company)
    {
        // حذف الشعار من التخزين إن وجد
        if ($company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
            Storage::disk('public')->delete($company->logo_path);
        }
    
        // حذف الشركة من قاعدة البيانات
        $company->delete();
    
        // إعادة التوجيه إلى نفس الصفحة
        $page = $request->input('page', 1);
        
        session()->flash("success","Company was Deleted successfully");
        
        return redirect()->route('company.my', ['page' => $page]);
    }
    

    
    public function fetchCompanyReviews(Request $request, Company $company)
    {
        $reviews = $company->reviews()
            ->with('user')
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->orderBy('rating', 'desc')
            ->paginate(10);
    
        return response()->json([
            'reviews' => $reviews,
        ]);
    }


    
    public function fetchCompanyCars(Request $request, Company $company)
    {
        $cars = $company->cars()
        ->select('id', 'price', 'year', 'color', 'brand', 'body_type', 'currency', 'model', 'company_id')
        ->with(['images' => function ($imageQuery) {
            $imageQuery->select('id','car_id', 'image_path');
        }])->orderBy('created_at', 'desc')->paginate(10);
    
        return response()->json([
            'cars' => $cars,
        ]);
    }
    public function myCompany(Request $request)
    {
        $user = Auth::user();
    
        // Get sort option from the request (default to 'default' if not provided)
        $currentPage = $request->input('page', 1);
        // Handle car status update if needed
       
    
        // Fetch cars with sorting and pagination
        $company = $this->getCompany($user,$currentPage);
    
        // Return the cars with other relevant info
        return Inertia::render('user-company/UserCompanies', [
            'company' => $company,
            'success' => session('success'),
            'hasVerifiedEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
        ]);
    }

    public function getCompany($user, $currentPage)
{
    $companyQuery =  Company::withCount(['reviews', 'cars']) 
    ->where('user_id', $user->id)->orderBy('created_at', 'desc');

return $companyQuery->paginate(20);
 // جلب 20 شركة
}

}
