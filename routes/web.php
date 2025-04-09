<?php

use App\Http\Controllers\CarController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
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

Route::middleware(CustomAuthenticate::class)->get('/createcar', function () {
    $user = Auth::user();
    return Inertia::render('Create-Cars/CreateCar',[
        'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
        ? $user->hasVerifiedEmail()
        : false,
    ]);
})->name('createcar');

Route::resource("car",CarController::class);

Route::resource("reviews",ReviewController::class);

Route::resource("company",CompanyController::class);

Route::get('/cars/search', [CarController::class, 'getCarsByBodyType'])->name('cars.byBodyType');

Route::get('/set-currency', function (Request $request) {
    session(['currency' => $request->currency]);
    return redirect()->back(); // Reload the page with the updated currency
    })->name('setCurrency');

Route::middleware(CustomAuthenticate::class)->get('/my-cars', [CarController::class, 'myCars'])->name('cars.my');

Route::middleware(CustomAuthenticate::class)->delete('/cars/{car}', [CarController::class, 'destroy'])->name('cars.destroy');

Route::middleware(CustomAuthenticate::class)->put('/cars/{car}/status', [CarController::class, 'updateStatus'])->name('cars.updateStatus');

Route::middleware(CustomAuthenticate::class)->get('/cars/edit/{id}', [CarController::class, 'edit'])->name('cars.edit');

Route::middleware(CustomAuthenticate::class)->put('/cars/{id}', [CarController::class, 'update'])->name('cars.update');

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




require __DIR__.'/auth.php';
