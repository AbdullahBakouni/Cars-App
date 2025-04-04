<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the welcome page with status message if available.
     */
    public function show(): Response
    {
        return Inertia::render('Welcome', [
            'status' => session('status'), // Pass status from session
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the email input
        $request->validate([
            'email' => 'required|email',
        ]);

        // Attempt to send the password reset link
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // If the reset link was sent successfully, redirect with a status message
        if ($status == Password::RESET_LINK_SENT) {
            session()->put('resetpassstatus', __($status));
        }
    
        // Return response (no redirection needed)

        // Otherwise, throw a validation exception with an error message
        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
