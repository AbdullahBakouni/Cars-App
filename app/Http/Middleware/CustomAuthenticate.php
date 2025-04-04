<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CustomAuthenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $guard = null): Response
    {

        if (Auth::guard($guard)->guest()) {
            // If the user is not logged in, redirect to the home page with a message
            return redirect()->route('home')->with('message', 'Login required')->with('message_type', 'error');
        }

        // Check if the user is logged in but not verified
        $user = Auth::guard($guard)->user();
        if ($user && !$user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail || !$user->hasVerifiedEmail()) {
            // Redirect to verification notice if email is not verified
            return redirect()->route('verification.notice');
             
        }

        // If the user is authenticated and email is verified, proceed with the request
        return $next($request);
    }
}
