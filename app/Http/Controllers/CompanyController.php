<?php

namespace App\Http\Controllers;

use App\Models\Car;
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
    $company = Company::with([
        'user.phones' => function ($query) {
            $query->select('user_id', 'number');
        },
        'reviews.user',
        'user',
        'reviews'
    ])->findOrFail($id);

    $sortOption = $request->query('sort', 'featured');

    $carsQuery = Car::select('id', 'year', 'price', 'rates', 'brand', 'model', 'description', 'mileage', 'currency', 'company_id', 'created_at')
        ->where('company_id', $company->id)
        ->with([
            'images' => function ($query) {
                $query->select('id', 'car_id', 'image_path')->limit(1);
            }
        ]);

    switch ($sortOption) {
        case 'price-low':
            $carsQuery->orderBy('price', 'asc');
            break;
        case 'price-high':
            $carsQuery->orderBy('price', 'desc');
            break;
        case 'newest':
            $carsQuery->orderBy('created_at', 'desc');
            break;
        case 'rating':
            $carsQuery->withAvg('reviews', 'rating')->orderBy('reviews_avg_rating', 'desc');
            break;
        default:
            $carsQuery->orderBy('created_at', 'desc');
            break;
    }

    $paginatedCars = $carsQuery->paginate(2)->withQueryString();
    $user = Auth::user();

    return Inertia::render('company/CompanyDetails', [
        'company' => $company,
        'cars' => $paginatedCars, // Full paginator object
        'sortOption' => $sortOption,
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
}
