<?php

use App\Http\Controllers\CarController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
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

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::middleware(['web'])->get('/', function () {
    $user = Auth::user();
    
    return Inertia::render('Welcome', [
        'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
            ? $user->hasVerifiedEmail()
            : false,
    ]);
})->name('home');

Route::get('/createcar', function () {
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

Route::get('/cars/byPrice', [CarController::class, 'searchByPrice'])->name('cars.byPrice');

Route::get('/cars/filter', [CarController::class, 'filter'])->name('cars.filter');


Route::get('/set-currency', function (Request $request) {
    session(['currency' => $request->currency]);
    return redirect()->back(); // Reload the page with the updated currency
})->name('setCurrency');

Route::get('/my-cars', [CarController::class, 'myCars'])->name('cars.my');

Route::delete('/cars/{car}', [CarController::class, 'destroy'])->name('cars.destroy');

Route::put('/cars/{car}/status', [CarController::class, 'updateStatus'])->name('cars.updateStatus');

Route::get('/cars/edit/{id}', [CarController::class, 'edit'])->name('cars.edit');

Route::put('/cars/{id}', [CarController::class, 'update'])->name('cars.update');

require __DIR__.'/auth.php';
