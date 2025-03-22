import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UserCircle2,
  Languages,
  ArrowLeft,
} from "lucide-react"
import { Link } from "@inertiajs/react"
import { Menu } from 'lucide-react';
import { Inertia } from '@inertiajs/inertia';
import LoggedInMenuContent from "@/components/LoggedInMenuContent"
import Register from "@/Pages/Auth/Register"
import Login from "@/Pages/Auth/Login"
import ForgotPassword from "./ForgotPassword"
import SellCarButton from "./SellCarButton"

const HamburgerMenu = ({authuser,status,hasVerifiedEmail}) => {
    const [showLoginForm, setShowLoginForm] = useState(false)
    const [showRegisterForm, setShowRegisterForm] = useState(false)
    const [showForgetPassword, setShowForgetPassword] = useState(false);

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
  return (
   <>
      <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className={authuser.user 
      ? "w-[380px] sm:w-[550px] p-0 h-[530px]" 
      : "w-[380px] sm:w-[550px] p-0 h-[500px]"}>
              {/* Use the same content as the regular menu Sheet */}
              <div className="flex flex-col h-full bg-white">
                {/* Header */}
                <div className="p-2 border-b">
                <div className="flex items-center justify-between">
                       <h2 className="text-lg font-semibold">
                         {authuser.user && hasVerifiedEmail ? 'ACCOUNT' : showRegisterForm ? 'REGISTER' : showLoginForm ? 'LOGIN' : 'MENU'}
                       </h2>
                     </div>
                </div>

                {/* Menu Content */}
                
                {authuser.user && hasVerifiedEmail ? (
                         <LoggedInMenuContent />
                     ) : authuser.user && hasVerifiedEmail ? (
                       <div className="flex-1 overflow-auto p-4">
                         <p className="font-bold text-lg mb-8 xs-range:text-sm">Please verify your email to proceed.</p>
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
   
               <Register/>
   
               <div className="text-center text-sm mt-4">
                 <span className="text-gray-600">Already have an account? </span>
                 <Button
                   variant="link"
                   className="p-0 h-auto text-blue-500 hover:text-blue-600"
                   onClick={() => {
                     setShowRegisterForm(false)
                     setShowLoginForm(true)
                   }}
                 >
                   Login
                 </Button>
               </div>
             </div>
           ) : (
             <div className="space-y-9">
               <Button
                 variant="ghost"
                 className="w-full justify-start text-base font-normal"
                 onClick={() => setShowLoginForm(true)}
               >
                 <UserCircle2 className="mr-4 h-5 w-5" />
                 Login / Register
               </Button>
   
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <Languages className="h-5 w-5" />
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
               <div className="absolute bottom-0 w-[350px]">
              <SellCarButton />
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
  )
}

export default HamburgerMenu
