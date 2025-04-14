<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
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
    public function getCarCount(Request $request)
    {
        $user = $request->user(); // Get the authenticated user
    
        // Check if user is authenticated
        // if (!$user) {
        //     return response()->json(['error' => 'Unauthorized'], 401);
        // }
    
        // Directly count the number of cars without loading all the data
        $carCount = $user->cars()->count();
        return response()->json([
            'car_count' => $carCount,
        ]);
    }

    public function getCompanyCount(Request $request)
    {
        $user = $request->user(); // Get the authenticated user
    
        // Check if user is authenticated
        // if (!$user) {
        //     return response()->json(['error' => 'Unauthorized'], 401);
        // }
    
        // Directly count the number of cars without loading all the data
        $companyCount = $user->companies()->count();
        return response()->json([
            'company_count' => $companyCount,
        ]);
    }

    public function fetchUserCompany(Request $request)
    {
         $user = Auth::user();

        $companies = Company::where('user_id', $user->id)
            ->select('id', 'company_name', 'logo_path')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    
        return response()->json($companies);
    }
}    
