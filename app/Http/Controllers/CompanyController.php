<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
    public function show(Request $request, $id)
    {
        // Retrieve the company with related users and cars
        $company = Company::with(['user', 'cars', 'reviews', 'cars.images', 'reviews.user'])
                          ->findOrFail($id);
        // Sorting logic
        $sortOption = $request->query('sort', 'featured');
    
        $cars = $company->cars();
        
        switch ($sortOption) {
            case 'price-low':
                $cars->orderBy('price', 'asc');
                break;
            case 'price-high':
                $cars->orderBy('price', 'desc');
                break;
            case 'newest':
                $cars->orderBy('created_at', 'desc');
                break;
            case 'rating':
                $cars->withAvg('reviews', 'rating')->orderBy('reviews_avg_rating', 'desc');
                break;
            default:
                // Default sorting (e.g., featured)
                $cars->orderBy('created_at', 'desc');
                break;
        }
    
        $company->cars = $cars->get();
    
        $reviewsByUser = $company->reviews->groupBy('user_id');
        $user = Auth::user();
        return Inertia::render('company/CompanyDetails', [
            'company' => $company,
            'reviewsByUser' => $reviewsByUser,
            'hasVerifiedEmail' => $user && $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail
                ? $user->hasVerifiedEmail()
                : false,
            'sortOption' => $sortOption,
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
