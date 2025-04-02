import { useEffect, useState } from 'react';
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Car,
    UserCircle2,
    Languages,
    Phone,
    ArrowLeft,
    CircleDollarSign,
} from "lucide-react"
import { Head, router } from '@inertiajs/react';
import Profile from './Profile';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';

export default function LoggedInMenuContent({currency}) {
    const [activeComponent, setActiveComponent] = useState('menu');

     const handleCurrencyChange = (value) => {
        router.get(route("setCurrency"), { currency: value }, { preserveState: true, preserveScroll: true });
    };
    const handleSellCarClick = () => {
          Inertia.visit(route('createcar'));
      };
      const [carCount, setCarCount] = useState(null); // Add loading state to track the request
    
      useEffect(() => {
        // Fetch car count only once when the component mounts
        const fetchCarCount = async () => {
          try {
            // Make the request to the API without Authorization header (since session is used)
            const response = await axios.get('/api/user/cars/count', {
              withCredentials: true, // Send cookies with the request
            });
            setCarCount(response.data.car_count); // Store the car count in state
          } catch (error) {
            console.error('Error fetching car count:', error);
          }
        };
    
        fetchCarCount(); // Call the function to fetch car count
      }, []);// Empty dependency array to run once on mount
    
    const renderContent = () => {
        switch (activeComponent) {
            case 'profile':
                return (
                  <div className="space-y-4">
                  <div className="flex items-center mb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 hover:bg-transparent"
                      onClick={() => setActiveComponent("main")}
                    >
                      <ArrowLeft className="h-2 w-4 mr-2" />
                      Back
                    </Button>
                  </div>
                  <Profile />
                  </div>
                )
            default:
                return (
                    <div className="space-y-8">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-base font-normal"
                            onClick={() => setActiveComponent('profile')}
                        >
                            <UserCircle2 className="mr-4 h-5 w-5" />
                            Profile
                        </Button>

                        <Button variant="ghost" className="w-full justify-start text-base font-normal group"
                         onClick={() => {
                            router.visit(route("cars.my")); // Navigate to My Cars page
                          }}
                        >
                            <Car className="mr-4 h-5 w-5" />
                            My Cars <span className="ml-2 text-blue-500">[{carCount}]</span>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start text-base font-normal">
                            <Phone className="mr-4 h-5 w-5" />
                            Called
                        </Button>

                        <div className="space-y-2">
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
                        <div className="space-y-2">
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
                       <div className="mt-auto p-6" onClick={handleSellCarClick}>
                         <Button className="w-full bg-blue-400 hover:bg-blue-500 text-white text-lg py-6 xs-range:py-2 -mt-10">
                          SELL YOUR CAR
                         </Button>
                    </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Head title="Profile" />
            {renderContent()}
        </>
    );
}
