<?php

use App\Http\Controllers\CarController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\CustomAuthenticate;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');


Route::middleware(CustomAuthenticate::class)->group(function () {
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});
Route::middleware(['web'])->get('/', function () {
    $user = Auth::user();
    
    return Inertia::render('Welcome', [
        'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
            ? $user->hasVerifiedEmail()
            : false,
            'message' => session('message'),
            'message_type' => session('message_type'),
    ]);
})->name('home');

Route::post('/setCompanySession', function () {
    $companyId = request()->input('company_id');
    $companyName = request()->input('company_name');
    $companyLogo = request()->input('company_logo');
    $companyLocation = request()->input('company_location');
    
    // تخزين البيانات في الجلسة
    session([
        'company_id' => $companyId,
        'company_name' => $companyName,
        'company_logo' => $companyLogo,
        'company_location' => $companyLocation,
    ]);

    // بعد تخزين البيانات في الجلسة، التوجيه إلى صفحة إنشاء السيارة
    return redirect()->route('createcar');
})->name('setCompanySession');

Route::middleware(CustomAuthenticate::class)->get('/createcar', function () {
    $user = Auth::user();

    $companyId = session('company_id');
    $companyName = session('company_name');
    $companyLogo = session('company_logo');
    $companyLocation = session('company_location');

    return Inertia::render('Create-Cars/CreateCar', [
        'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
            ? $user->hasVerifiedEmail()
            : false,
        'company_id' => $companyId,
        'company_name' => $companyName,
        'company_logo' => $companyLogo,
        'company_location' => $companyLocation,
    ]);
})->name('createcar');


Route::post('/clearCompanySession', function () {
    session()->forget(['company_id', 'company_name', 'company_logo', 'company_location']);
    // return response()->json(['message' => 'Data cleared successfully']);
})->name('clearCompanySession');

// Route لتخزين بيانات الشركة في الجلسة



Route::resource("car",CarController::class);

Route::resource("reviews",ReviewController::class);

Route::resource("company",CompanyController::class);

Route::match(['get', 'post'],'/cars/search', [CarController::class, 'getCarsByBodyType'])->name('cars.byBodyType');
Route::post('/cars/filter', [CarController::class, 'filterCars'])->name('cars.filters');

Route::get('/set-currency', function (Request $request) {
    session(['currency' => $request->currency]);
    return redirect()->back(); // Reload the page with the updated currency
    })->name('setCurrency');

    Route::middleware(CustomAuthenticate::class)
    ->match(['get', 'post'], '/my-cars', [CarController::class, 'myCars'])
    ->name('cars.my');

Route::middleware(CustomAuthenticate::class)->get('/my-company', [CompanyController::class, 'myCompany'])->name('company.my');


Route::get('/cars/show', [CarController::class, 'show'])->name('cars.show');

Route::post('/cars/session', [CarController::class, 'setSession'])->name('cars.setSession');

Route::get('/company/show', [CompanyController::class, 'show'])->name('companies.show');

Route::post('/companies/session', [CompanyController::class, 'setSession'])->name('cars.setSession');

Route::middleware(CustomAuthenticate::class)->delete('/cars/destroy', [CarController::class, 'destroy'])->name('cars.destroy');

Route::middleware(CustomAuthenticate::class)
    ->get('/cars/edit', [CarController::class, 'edit'])
    ->name('cars.edit');


Route::middleware(CustomAuthenticate::class)->put('/cars/update/{id}', [CarController::class, 'update'])->name('cars.update');

Route::middleware(CustomAuthenticate::class)->post('/store-phone-session', function () {
    $user = Auth::user();
    $ActualUser = User::find($user->id);
    if ($user && $ActualUser->phones()->exists()) {
        session(['user_phone' => $ActualUser->phones]);
        return back()->with(['user_phone' => session('user_phone')]); // Inertia-friendly response
    }
    else {
        // If no phone exists, store null in the session
        session(['user_phone' => null]);
    }

    return back()->with(['error' => 'No phone found for this user']);
})->name('store_user_phone');

Route::get('/cars/{car}/reviews', [CarController::class, 'fetchReviews'])->name('cars.reviews.paginated');

Route::get('/copmany/{company}/reviews', [CompanyController::class, 'fetchCompanyReviews'])->name('company.reviews.paginated');

Route::get('/copmany/{company}/cars', [CompanyController::class, 'fetchCompanyCars'])->name('company.cars.paginated');


Route::get('/user/companies', [UserController::class, 'fetchUserCompany'])->name('user.company.paginated');

Route::middleware(CustomAuthenticate::class)->put('/company/{company}', [CompanyController::class, 'update'])->name('company.update');

Route::post('/cars/my/status-update', [CarController::class, 'updateStatus'])->name('cars.updateStatus');


Route::get('/recent-cars', [CarController::class, 'recentCars'])->name("recent_cars");


Route::get('/aboutus', function () {
    return Inertia::render('AboutUs');
});


Route::get('/notice', function () {
    return Inertia::render('Terms');
});



require __DIR__.'/auth.php';
