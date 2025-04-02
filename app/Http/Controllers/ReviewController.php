<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Company;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
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
    {      // Validate the request data
        $validated = $request->validate([
            'car_id' => 'nullable|exists:cars,id',
            'company_id' => 'nullable|exists:company,id',
            'rating' => 'required|numeric|min:1|max:5',  // Ensure the rating is between 1 and 5
            'comment' => 'nullable|string|max:1000',
        ]);
        $user = Auth::user(); 
        // Create the review record
        $review = Review::create([
            'user_id' =>$user->id,
            'car_id' => $validated['car_id'] ?? null,
            'company_id' => $validated['company_id'] ?? null,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);
        // Update the car's rating if the review is for a car
        if ($review->car_id) {
            $car = Car::findOrFail($review->car_id);
            $car->updateCarRating();  // Recalculate and update car rating
        }

        // Update the company's rating if the review is for a company
        if ($review->company_id) {
            $company = Company::findOrFail($review->company_id);
            $company->updateCompanyRating();  // Recalculate and update company rating
        }

        // Redirect or return a response after review submission
        return redirect()->back()->with('message', 'Thank you for your review!');
    
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
