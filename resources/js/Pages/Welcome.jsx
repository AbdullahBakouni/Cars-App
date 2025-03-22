
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Car,
  Truck,
  Bus,
  Package,
} from "lucide-react";
import carData from "./cars";
import NavBar from "@/Components/NavBar";
import { Inertia } from "@inertiajs/inertia";


export default function Welcome({auth , status , hasVerifiedEmail}) {
 
  const [maxPrice, setMaxPrice] = useState("")
  const [expandMakes, setExpandMakes] = useState(false)

  const bodyTypes = [
    { id: "coupe", label: "COUPE", icon: <Car className="w-6 h-6" /> },
    { id: "sedan", label: "SEDAN", icon: <Car className="w-6 h-6" /> },
    { id: "suv", label: "SUV", icon: <Car className="w-6 h-6" /> },
    { id: "hatch", label: "HATCH", icon: <Car className="w-6 h-6" /> },
    { id: "wagon", label: "WAGON", icon: <Car className="w-6 h-6" /> },
    { id: "pickup", label: "PICKUP", icon: <Truck className="w-6 h-6" /> },
    { id: "minivan", label: "MINIVAN", icon: <Bus className="w-6 h-6" /> },
    { id: "commercial", label: "COMMERCIAL", icon: <Truck className="w-6 h-6" /> },
    { id: "other", label: "OTHER", icon: <Package className="w-6 h-6" /> },
  ]
  

 
  const handleBodyTypeClick = (typeId) => {
    Inertia.visit(route("cars.byBodyType", { body_type: typeId }));
  };

  const handleBrandNameClick = (brandName) => {
    Inertia.visit(route("cars.byBodyType", { brand_name: brandName }));
  };
  const handleSearch = () => {
    if (!maxPrice) return; // لا ترسل الطلب إذا لم يدخل المستخدم سعراً
  console.log(maxPrice)
    Inertia.visit(route('cars.byPrice'), {
      method: 'get',
      data: { maxPrice },
      preserveState: true, // الاحتفاظ بحالة الصفحة
    });
  };
  return (
    <>
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
     <NavBar auth = {auth} status = {status} hasVerifiedEmail = {hasVerifiedEmail}/>

      {/* Main Content */}
      <main className="md:flex-1 relative overflow-hidden">
        {/* Background Dots */}
        <div className="absolute left-0 bottom-0 opacity-20">
          <div className="grid grid-cols-6 gap-2">
            {Array(24)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-400"></div>
              ))}
          </div>
        </div>

        {/* Car Image and Overlay */}
        <div className="relative w-full md:h-[500px] flex items-center justify-center bg-gray-200 md:-mt-12 xs-range:bg-gray-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl md:text-6xl font-bold text-gray-800 flex items-center xs-range:text-3xl">
              <span>sayart</span>
              <span className="text-blue-500">ii</span>
              <span>.com</span>
              <span className="mx-8 text-gray-300">|</span>
              <span>Syria</span>
            </div>
          </div>
          <img 
          src="https://sayartii.com/static/img/s-car.webp"
          alt="Luxury Car"
          width="600"
          height="500"
          className="object-contain"
        />
        </div>

        {/* Search Box */}
        <div className="absolute bottom-[165px] left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-2 xs-range:relative sm-range:relative
        sm-range:bottom-2 xs-range:bottom-1">
          <div className="bg-white rounded-lg shadow-xl p-4 xs-range:p-2 xs-range:rounded-sm 
          sm-range:p-3 sm-range:max-w-2xl xs-range:max-w-xl">
            <div className="flex flex-row items-center gap-4">
              <div className="flex-1">
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1 xs-range:text-xs">
                  Maximum price in SYP
                </label>
                <Input
                  id="maxPrice"
                  type="number"
                  className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <Button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-10 mt-4 md:mt-6 xs-range:px-4">
                Search <span className="ml-1">→</span>
              </Button>
            </div>
          </div>
        </div>
         
            
        {/* Right Bottom Dots */}
        <div className="absolute right-0 bottom-0 opacity-20">
          <div className="grid grid-cols-6 gap-2">
            {Array(24)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-600"></div>
              ))}
          </div>
        </div>
        <div className="pt-6 border-t">
        <div className="flex items-center mb-2">
      <h2 className="text-sm font-semibold text-gray-700 ml-1">BODY TYPE</h2>
      <div className="ml-2 h-px bg-gray-300 flex-grow">

      </div>
    </div>

       {/* Body Type Section */}
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {bodyTypes.map((type) => (
            <div key={type.id} className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => handleBodyTypeClick(type.id)}>
            <div className="w-10 h-10 flex items-center justify-center mb-1 text-blue-500">{type.icon}</div>
            <span className="text-[10px] text-center">{type.label}</span>
          </div>
        ))}
      </div>
        </div>

                <div className="pt-5">
                <div className="mb-2 text-center">
                  <h2 className="text-lg font-bold text-gray-800 italic">FEATURED CARS</h2>
                  <p className="text-xs text-gray-600">Current Deals</p>
                </div>
              </div>

  </main>
                <div>
                <div className="pt-4">
                <div className="flex items-center mb-2">
                  <h2 className="text-sm font-semibold text-gray-700 italic mr-2 ml-1">MAKE</h2>
                  <button
                    className="text-xs text-blue-500 hover:text-blue-600"
                    onClick={() => setExpandMakes(!expandMakes)}
                  >
                    {expandMakes ? "Collapse" : "Expand"}
                  </button>
                  <div className="ml-2 h-px bg-gray-300 flex-grow"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                  {carData.data.slice(0, expandMakes ? carData.data.length : 10).map((brand) => (
                    <div key={brand.id} className="flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => handleBrandNameClick(brand.name)}
                    >
                      <div className="w-10 h-10 flex items-center justify-center mb-2">
                        <img
                          src={brand.image || "/placeholder.svg"}
                          alt={brand.name}
                          width={60}
                          height={60}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-[12px] text-center">{brand.name}</span>
                    </div>
                  ))}
                </div>
              </div>
                </div>
    </div>
    
  </>
  )
}

