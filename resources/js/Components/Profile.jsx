import React, { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ArrowRight, ChevronDown, ShieldAlert } from "lucide-react"
import { router, useForm, usePage } from '@inertiajs/react';
import InputError from './InputError';
import { Popover, PopoverContent , PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const Profile = () => {
  const user = usePage().props.auth.user;
  const { user_phone } = usePage().props;
  
  // Set initial state for phone and phone_id
  const [selectedPhone, setSelectedPhone] = useState('');
  const [selectedPhoneId, setSelectedPhoneId] = useState(null);
  const [UserPhone, setUserPhone] = useState(user_phone || []);
  
  // Setup the form state using Inertia's useForm hook
  const { data, setData, patch, errors, processing } = useForm({
    name: user.name,
    email: user.email,
    phone_id: user_phone?.[0]?.id || '',
    phone: user_phone?.[0]?.number || '',
  });

  useEffect(() => {
    // When user_phone is set, update the local states for phone and phone_id
    if (user_phone && user_phone.length > 0) {
      setUserPhone(user_phone);
      setSelectedPhone(user_phone[0].number);
      setData('phone', user_phone[0].number);
      setData('phone_id', user_phone[0]?.id);
    }
  }, [user_phone]);

  // Handle phone number change in the input field
  const handlePhoneChange = (e) => {
    setSelectedPhone(e.target.value); // Update selected phone
    setData("phone", e.target.value); // Sync with form data
  }

  // Handle phone selection from the dropdown
  const handlePhoneSelect = (phoneId, phoneNumber) => {
    setSelectedPhone(phoneNumber);  // Set the selected phone number
    setSelectedPhoneId(phoneId);    // Set the selected phone's ID
    setData("phone", phoneNumber);  // Sync the selected phone number with form data
    setData("phone_id", phoneId);   // Sync the selected phone ID with form data
  }

  // Submit form with the updated data
  const submit = (e) => {
    e.preventDefault();
    console.log("Form data:", data); // This will contain both phone_id and phone
    patch(route('profile.update')); // Submit form data to update profile (assuming this route is defined)
  };

  const handleLogout = () => {
    router.post(route('logout')); // Logout the user
  };

  return (
    <>
      <div className="bg-gray-500 text-white p-1 -mx-0 mt-0 rounded-full">
        <h2 className="text-lg sm-range:text-sm xs-range:text-sm">{user.name}</h2>
      </div>
      
      {/* Update Profile Form */}
      <form onSubmit={submit}>
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-center sm-range:text-sm xs-range:text-sm">Update Profile</h3>

          <div className="space-y-2">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm text-gray-800 ml-4">Email</label>
              <Input
                id="email"
                type="email"
                className="w-full text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400 text-sm cursor-default"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                required
                readOnly
                autoComplete="username"
              />
              <InputError className="mt-1" message={errors.email} />
            </div>

            {/* Name Input */}
            <div className="space-y-2 relative">
              <label className="text-sm text-gray-800 ml-2">Name</label>
              <Input
                type="text"
                className="w-full focus:outline-none focus:ring-0 focus:border-gray-400 text-sm"
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
                autoComplete="name"
              />
              <Popover open={!!errors.name}>
                {errors.name && (
                  <PopoverTrigger className='text-sm p-0 absolute text-gray-600 top-0 right-8'>
                    <ShieldAlert className='h-5 w-5'/>
                  </PopoverTrigger>
                )}
                <PopoverContent className="text-red-500 p-1 w-24 text-xs rounded-full font-bold">
                  {errors.name}
                </PopoverContent>
              </Popover>
            </div>

            {/* Phone Input with Dropdown */}
            <div className="space-y-2 relative">
              <label className="text-sm text-gray-800 ml-2">Phone</label>
              <div className="relative">
                <div className="flex items-center">
                  <Input
                    type="tel"
                    value={selectedPhone}
                    onChange={handlePhoneChange}
                    placeholder="Select or enter a phone number"
                    className="pr-10 focus:outline-none focus:ring-0 focus:border-gray-400 text-sm"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full rounded-l-none">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[240px]">
                      {UserPhone.map((phone) => (
                        <DropdownMenuItem key={phone.id} onClick={() => handlePhoneSelect(phone.id, phone.number)}>
                          {phone.number}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <Popover open={!!errors.phone}>
                {errors.phone && (
                  <PopoverTrigger className='text-sm p-0 absolute text-gray-600 top-0 right-8'>
                    <ShieldAlert className='h-5 w-5'/>
                  </PopoverTrigger>
                )}
                <PopoverContent className="text-red-500 p-1 w-24 text-xs rounded-full font-bold">
                  {errors.phone}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className='flex items-center justify-center'>
            <Button className="w-40 bg-primary hover:bg-primary-hover text-white rounded-lg font-normal sm-range:p-1 " disabled={processing}>
              Update
            </Button>
          </div>
        </div>
      </form>

      {/* Signout Button */}
      <div className="border-t p-2 mt-3 flex items-center justify-start">
        <Button variant="ghost" className="w-40 justify-start text-base font-normal text-gray-800" onClick={handleLogout}>
          <ArrowRight className="mr-2 h-5 w-5" />
          Signout
        </Button>
      </div>
    </>
  );
}

export default Profile;
