<?php

use App\Http\Controllers\CarController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('cars/models', [CarController::class, 'getModels']);

Route::middleware(['web'])->get('/user/cars/count', [UserController::class, 'getCarCount']);
Route::middleware(['web'])->get('/user/company/count', [UserController::class, 'getCompanyCount']);



