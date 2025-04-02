import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle2, Languages, ArrowLeft, CircleDollarSign } from "lucide-react";


import LoggedInMenuContent from "@/components/LoggedInMenuContent";
import Register from "@/Pages/Auth/Register";
import Login from "@/Pages/Auth/Login";
import ForgotPassword from "@/components/ForgotPassword";

import { Inertia } from '@inertiajs/inertia';
import { router } from "@inertiajs/react";


const MainMenu = ({ authuser , status , hasVerifiedEmail , currency}) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showForgetPassword, setShowForgetPassword] = useState(false);
 // The login state (false means logged out)

// Show the menu and login content by default if login === false
  const handleCurrencyChange = (value) => {
    router.get(route("setCurrency"), { currency: value }, { preserveState: true, preserveScroll: true });
};
  const handleForgetPasswordClick = () => {
    setShowForgetPassword(true);
  };

  const handleReturnToMainMenu = () => {
    setShowForgetPassword(false); // Go back to the main menu
  };
  const handleResendVerification = () => {
    // Redirect using Inertia's visit method
    Inertia.visit(route('verification.notice'));
  };
  const handleSellCarClick = () => {
    if (authuser?.user && hasVerifiedEmail) {
      Inertia.visit(route('createcar'));
    } else {
      setShowLoginForm(true);
    }
  };
  return (
    <>
      <Sheet >
        <SheetTrigger asChild>
          <Button variant="outline" className="hidden md:inline-flex">
            Menu
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 h-[550px]">
          <div className="flex flex-col h-[500px] bg-white">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {authuser.user && hasVerifiedEmail
                    ? "ACCOUNT"
                    : showRegisterForm
                    ? "REGISTER"
                    : showLoginForm 
                    ? "LOGIN"
                    : "MENU"}
                </h2>
              </div>
            </div>
            {authuser.user && hasVerifiedEmail ? (
          <LoggedInMenuContent currency = {currency}/>
      ) : authuser.user && hasVerifiedEmail ? (
        <div className="flex-1 overflow-auto p-4">
          <p className="font-bold text-lg mb-8">Please verify your email to proceed.</p>
              <Button className= "w-full bg-blue-500 hover:bg-blue-600 text-white" 
              onClick={handleResendVerification} >
                Verify Eamil
                </Button>
        </div>
    ) : (
  <div className="flex-1 overflow-auto p-4 relative">
    {showForgetPassword ? (
      <ForgotPassword onReturn={handleReturnToMainMenu} status={status} />
    ) : (
      <>
        {showLoginForm && !showRegisterForm ? (
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 hover:bg-transparent"
                onClick={() => setShowLoginForm(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>

            <Login />

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">Or Create Account</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setShowRegisterForm(true)}
            >
              Create New Account
            </Button>
            
            <div className="text-center text-sm mt-4">
              <span className="text-gray-600">Forgot your password? </span>
              <button
                onClick={handleForgetPasswordClick}
                className="text-blue-500 hover:text-blue-600"
              >
                Reset Password
              </button>
            </div>
          </div>
        ) : showRegisterForm ? (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 hover:bg-transparent"
                onClick={() => setShowRegisterForm(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>

            <Register />

            <div className="text-center text-sm mt-4">
              <span className="text-gray-600">Already have an account? </span>
              <Button
                variant="link"
                className="p-0 h-auto text-blue-500 hover:text-blue-600"
                onClick={() => {
                  setShowRegisterForm(false);
                  setShowLoginForm(true);
                }}
              >
                Login
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <Button
              variant="ghost"
              className="w-full justify-start text-base font-normal"
              onClick={() => setShowLoginForm(true)}
            >
              <UserCircle2 className="mr-4 h-5 w-5" />
              Login / Register
            </Button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 ml-4 mr-3" />
                <span className="text-sm">Language</span>
              </div>
              <Select defaultValue="en">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="English" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 ml-4 mr-3" />
                <span className="text-sm">Currency</span>
              </div>
              <Select onValueChange={handleCurrencyChange} defaultValue={currency ?? "SYP"}>
                <SelectTrigger className="w-full">
                <SelectValue placeholder={currency === null ? "SYP" : currency} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SYP">SYP</SelectItem>
                </SelectContent>
              </Select>
            </div>
           
            <div className="absolute bottom-0 w-[350px]">
              <div className="mt-auto p-2">
                         <Button className="w-full bg-blue-400 hover:bg-blue-500 text-white text-lg py-6"
                          onClick={handleSellCarClick}>
                          SELL YOUR CAR
                          </Button>
                 </div>
            </div>
          </div>
        )}
      </>
    )}
  </div>
)}

    </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MainMenu;
