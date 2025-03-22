import React from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  ArrowRight,
  ShieldAlert,
} from "lucide-react"
import { router, useForm, usePage } from '@inertiajs/react';
import InputError from './InputError';
import { Popover, PopoverContent , PopoverTrigger,} from "@/components/ui/popover";
const Profile = () => {
      const user = usePage().props.auth.user;
      const { data, setData, patch, errors, processing, recentlySuccessful } =
      useForm({
          name: user.name,
          email: user.email,
          phone:user.phone,
      });

  const submit = (e) => {
      e.preventDefault();

      patch(route('profile.update'));
  };
  const handleLogout = () => {
    router.post(route('logout'));
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

      <div className="space-y-2 relative">
        <label className="text-sm text-gray-800  ml-2">Name</label>
        <Input
          type="text"
          className="w-full focus:outline-none focus:ring-0 focus:border-gray-400 text-sm"
          id="name"
        value={data.name}
         onChange={(e) => setData('name', e.target.value)}
        required
        isFocused
        autoComplete="name"
        />
        <Popover open={!!errors.name}>
        {errors.name && (
          <PopoverTrigger className='text-sm p-0 absolute text-gray-600 top-0 right-8'>
            <ShieldAlert className=' h-5 w-5'/>
            </PopoverTrigger>
        )}
        <PopoverContent className="text-red-500 p-1 w-24 text-xs rounded-full font-bold">
          {errors.name}
        </PopoverContent>
      </Popover>
      </div>


      <div className="space-y-2 relative">
        <label className="text-sm text-gray-800  ml-2">Phone</label>
        <Input
          type="tel"
          placeholder="+963"
          className="w-full focus:outline-none focus:ring-0 focus:border-gray-400 text-sm"
          id="phone"
        value={data.phone}
         onChange={(e) => setData('phone', e.target.value)}
        isFocused
        autoComplete="phone"
        />
          <Popover open={!!errors.phone}>
        {errors.phone && (
          <PopoverTrigger className='text-sm p-0 absolute text-gray-600 top-0 right-8'>
            <ShieldAlert className=' h-5 w-5'/>
            </PopoverTrigger>
        )}
        <PopoverContent className="text-red-500 p-1 w-24 text-xs rounded-full font-bold">
          {errors.phone}
        </PopoverContent>
      </Popover>
      </div>
    </div>

    <div className='flex items-center justify-center'>
    <Button className="w-40 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-normal 
    sm-range:p-1">Update</Button>
    </div>
  </div>
  </form>
  <div className="border-t p-2 mt-3 flex items-center justify-start">
    <Button
      variant="ghost"
      className="w-40 justify-start text-base font-normal text-gray-800 "
      onClick={handleLogout}
    >
      <ArrowRight className="mr-2 h-5 w-5" />
      Signout
    </Button>
  </div>
  
  </>
  )
}

export default Profile
