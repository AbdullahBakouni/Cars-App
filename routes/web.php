<?php

use App\Http\Controllers\CarController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
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
})->name('main');

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
    return Inertia::render('Create-Cars/CreateCar');
})->name('createcar');

Route::resource("car",CarController::class);

Route::get('/cars/body-type', [CarController::class, 'getCarsByBodyType'])->name('cars.byBodyType');

Route::get('/cars/byPrice', [CarController::class, 'searchByPrice'])->name('cars.byPrice');

require __DIR__.'/auth.php';
