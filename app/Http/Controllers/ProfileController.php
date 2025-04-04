<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;


class ProfileController extends Controller
{
    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request)
{
    $user = $request->user(); // Get the authenticated user

    // Validate and normalize the phone number
    if ($request->has('phone') && !empty($request->phone)) {
        // Remove non-numeric characters (e.g., spaces, dashes, etc.)
        $normalizedPhone = preg_replace('/\D/', '', $request->phone);

        // Case 1: If the phone starts with 09 and is 10 digits long
        if (substr($normalizedPhone, 0, 2) === '09' && strlen($normalizedPhone) === 10) {
            // If the number starts with 09, replace it with +963
            $normalizedPhone = '+963 ' . substr($normalizedPhone, 1);  // Replace 0 with +963
        } 
        // Case 2: If the phone starts with 963 and is 11 digits long (already normalized without the +)
        elseif (substr($normalizedPhone, 0, 3) === '963' && strlen($normalizedPhone) === 12) {
            // If the number starts with 963, add +963 to the front and format it
            $normalizedPhone = '+963 ' . substr($normalizedPhone, 3);  // Keep +963 and add the remaining digits
        } else {
            // If the phone number is not in the correct format, return an error
            return redirect()->back()->withErrors(['phone' => 'Invalid phone number format.']);
        }
    }

    // Update user's name and email
        $user->fill($request->only(['name', 'email']));

    if ($user->isDirty('email')) {
        $user->email_verified_at = null;
    }

    $user->save(); // Save user changes

    // Handle phone number update
    if ($request->filled('phone_id') && $request->filled('phone')) {
        $phoneId = $request->input('phone_id');
        $phoneNumber = $normalizedPhone;  // Use the normalized phone number

        // Check if the phone ID exists for the user
        $userPhone = $user->phones()->find($phoneId);

        if ($userPhone) {
            // Update existing phone
            $userPhone->update(['number' => $phoneNumber]);
        } else {
            // Create new phone record if the phone ID doesn't exist
            $user->phones()->create(['number' => $phoneNumber]);
        }
    }

    return redirect()->back()->with('success', 'Profile updated successfully!');
}

    

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
