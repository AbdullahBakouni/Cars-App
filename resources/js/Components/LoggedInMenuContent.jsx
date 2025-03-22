import { useState } from 'react';
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Car,
    UserCircle2,
    Languages,
    Phone,
    ArrowLeft,
} from "lucide-react"
import SellCarButton from "./SellCarButton"
import { Head } from '@inertiajs/react';
import Profile from './Profile';
import { Inertia } from '@inertiajs/inertia';

export default function LoggedInMenuContent() {
    const [activeComponent, setActiveComponent] = useState('menu');

    const handleSellCarClick = () => {
          Inertia.visit(route('createcar'));
      };
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

                        <Button variant="ghost" className="w-full justify-start text-base font-normal group">
                            <Car className="mr-4 h-5 w-5" />
                            My Cars <span className="ml-2 text-blue-500">[0]</span>
                        </Button>

                        <Button variant="ghost" className="w-full justify-start text-base font-normal">
                            <Phone className="mr-4 h-5 w-5" />
                            Called
                        </Button>

                        <div className="space-y-3">
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
                       <div className="mt-auto p-6" onClick={handleSellCarClick}>
                         <Button className="w-full bg-blue-400 hover:bg-blue-500 text-white text-lg py-6">
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
