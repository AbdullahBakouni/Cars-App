
import { Sheet, SheetContent, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { Bus, Car, Check, MapPin, Package, SlidersHorizontal, Trash2, Truck , Wrench, Zap , Fuel , Palette, X} from "lucide-react"
import { Input } from "./ui/input"
import { useEffect, useRef, useState } from "react"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { cn } from "@/lib/utils";
import { router, useForm } from "@inertiajs/react"
import SearchFilterBar from "./SearchFilterBar"
import axios from "axios"
import { Inertia } from "@inertiajs/inertia"


const FilterButton = () => {
     const { data, setData, post } = useForm({
        brand_name: '',
        model_name: '',
        yearfrom:  '',
        yearto:  '',
        pricefrom:  '',
        priceto:  '',
        mileagefrom:  '',
        mileageto:  '',
        location:  '',
        body_type: '',
        mileage: '',
        currency: '',
        status: '',
        rental_type:'',
        condition:'',
        doors: '',
        cylinders:  '',
        engine: '',
        transmission:  '',
        fuel: '',
        color: '',
    });
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState(null);
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [resetSearchTermTrigger, setResetSearchTermTrigger] = useState(0);
  const isDataEmpty = Object.values(data).every((value) => value === "" || value === null || value === undefined);

  // إرسال البيانات إلى الخادم بعد تعديل الفورم باستخدام debounce
  useEffect(() => {
    const hasAnyValue = Object.values(data).some(value => value !== '');
    if (!hasAnyValue) {
      setCount(0);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await axios.post(route('cars.filters'), data);
        setCount(response.data.count);
      } catch (error) {
        console.error('Error fetching car count:', error);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [
    data.brand_name,
    data.model_name,
    data.yearfrom,
    data.yearto,
    data.pricefrom,
    data.priceto,
    data.mileagefrom,
    data.mileageto,
    data.location,
    data.body_type,
    data.mileage,
    data.currency,
    data.status,
    data.rental_type,
    data.condition,
    data.doors,
    data.cylinders,
    data.engine,
    data.transmission,
    data.fuel,
    data.color,
  ]);

  // مسح الفلاتر
  const clearFilters = () => {
    setData({
      brand_name: '',
      model_name: '',
      yearfrom: '',
      yearto: '',
      pricefrom: '',
      priceto: '',
      mileagefrom: '',
      mileageto: '',
      location: '',
      body_type: '',
      mileage: '',
      currency: '',
      status: '',
      rental_type: '',
      condition: '',
      doors: '',
      cylinders: '',
      engine: '',
      transmission: '',
      fuel: '',
      color: '',
    });
    setSelectedBodyType(null);
    setSelectedColor('');
    setFilterResetKey(prev => prev + 1);
  };

  
  const bodyTypes = [
    { id: "coupe", label: "Coupe", icon: <Car className="w-6 h-6" /> },
    { id: "sedan", label: "Sedan", icon: <Car className="w-6 h-6" /> },
    { id: "suv", label: "SUV", icon: <Car className="w-6 h-6" /> },
    { id: "hatch", label: "Hatch", icon: <Car className="w-6 h-6" /> },
    { id: "wagon", label: "Wagon", icon: <Car className="w-6 h-6" /> },
    { id: "pickup", label: "Pickup", icon: <Truck className="w-6 h-6" /> },
    { id: "minivan", label: "Minivan", icon: <Bus className="w-6 h-6" /> },
    { id: "commercial", label: "Commercial", icon: <Truck className="w-6 h-6" /> },
    { id: "other", label: "Other", icon: <Package className="w-6 h-6" /> },
  ]
  
const doorOptions = ["2", "3", "4", "5"]
const cylinderOptions = ["Electric", "2", "3", "4", "6", "8", "10", "12", "16"]
const transmissionOptions = ["Automatic", "Manual"]
const fuelOptions = ["Diesel", "Petrol", "Electric", "Hybrid", "Other"]
const colorOptions = [
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "black", label: "Black", hex: "#000000" },
  { value: "silver", label: "Silver", hex: "#C0C0C0" },
  { value: "gray", label: "Gray", hex: "#808080" },
  { value: "red", label: "Red", hex: "#FF0000" },
  { value: "blue", label: "Blue", hex: "#0000FF" },
  { value: "green", label: "Green", hex: "#008000" },
  { value: "yellow", label: "Yellow", hex: "#FFFF00" },
  { value: "brown", label: "Brown", hex: "#A52A2A" },
  { value: "orange", label: "Orange", hex: "#FFA500" },
  { value: "purple", label: "Purple", hex: "#800080" },
  { value: "beige", label: "Beige", hex: "#F5F5DCC" },
  { value: "other", label: "Other", hex: "#9f372e" },
]
  const handlestatuschange = (value) => {
    setData('status', value);
  }
  
  const handleRentalTypechange = (value) => {
    setData("rental_type", value);
  }
  const handleConditionchange = (value) => {
    setData("condition", value);
  }
  const handlecurrencychange = (value) => {
    setData("currency", value);
  }
  const handleColorChange = (colorValue) => {
    setSelectedColor(colorValue); // Update the selected color
    setData("color", colorValue);   // Update form data
  };
  const toggleBodyType = (type) => {
    const newValue = type === selectedBodyType ? null : type; // deselect if same
    setSelectedBodyType(newValue);
    setData('body_type', newValue);
  };
  const getLabel = (key) => {
    const labels = {
      brand_name: "Brand",
      model_name: "Model",
      yearfrom: "Year From",
      yearto: "Year To",
      status: "Status",
      rental_type: "Rent Type",
      condition: "Condition",
      currency: "Currency",
      pricefrom: "Price From",
      priceto: "Price To",
      body_type: "Body Type",
      mileagefrom: "Mileage From",
      mileageto: "Mileage To",
      location: "Location",
      doors: "Doors",
      cylinders: "Cylinders",
      engine: "Engine",
      transmission: "Transmission",
      fuel: "Fuel",
      color: "Color",
    };
    return labels[key] || key;
  };
  const handleValueChange = (key) => {
    console.log("key clicked:", key);
    setData((prev) => ({
      ...prev,
      [key]: "",
    }));
    switch (key) {
      case "body_type":
        console.log("Clearing bodyType");
        setSelectedBodyType(null);
        break;
      case "color":
        setSelectedColor("");
        break;
        case "brand_name":
          case "model_name":
            setResetSearchTermTrigger(prev => prev + 1); // trigger clearing
            break;
      // ممكن تضيف حالات تانية هون حسب الحاجة
      default:
        break;
    }
  };  
  const submit = (e) => {
    e.preventDefault();

    // تحقّق إذا كل القيم فاضية
    const isEmpty = Object.values(data).every((value) => value === "" || value === null || value === undefined);
  
    if (isEmpty) {
      return; // وقف التنفيذ
    }
    post(route('cars.byBodyType'), data ,{
      preserveScroll: true,
      preserveState: true,
    });
  };
 

  const isElectric = data.cylinders === "Electric";
  return (
    <>
    
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-r-none border-r-0 bg-primary text-white hover:bg-primary-hover hover:text-white xs-range:p-2">
                  <SlidersHorizontal className="h-4 w-4 xs-range:h-2 xs-range:w-2" />
                  <span className="ml-2 hidden sm:inline">Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[400px] sm:w-[540px] p-0 xs-s-range:w-[360px] xs-range:w-[370px]">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">SEARCHING</h2>
                      <Button variant="ghost" className="text-primary-hover hover:text-primary-hover" onClick={clearFilters}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                    {Object.entries(data).some(([_, value]) => value !== "") && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(data).map(
                            ([key, value]) =>
                              value !== "" && (
                                <div
                                  key={key}
                                  className="flex items-center bg-primary text-white rounded-full px-3 py-1 text-sm"
                                >
                                  <span>{getLabel(key)}: {value}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 ml-1"
                                    onClick={() => handleValueChange(key)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Filters Content */}
                 
                  <div className="flex-1 overflow-auto p-6">
                
                    <div className="space-y-6">
                      {/* Make/Model */}
                      <div className="space-y-2">
                      <Label htmlFor="Brand&Model" className = "text-sm text-gray-600">Brand&Model</Label>
                        <SearchFilterBar setData={setData} key={filterResetKey} resetSearchTermTrigger={resetSearchTermTrigger} />
                      </div>

                      {/* Year Range */}
                      <div className="space-y-2">
                      <Label htmlFor="year" className = "text-sm text-gray-600">Year</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            value={data.yearfrom}
                            onChange={(e) => setData("yearfrom", e.target.value)}
                            placeholder="From"
                            type="number"
                            className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                          />
                          <Input
                            value={data.yearto}
                            onChange={(e) => setData("yearto", e.target.value)}
                            placeholder="To"
                            type="number"
                            className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                          />
                        </div>
                      </div>

                     
                      <div className="space-y-2">
                    <Label htmlFor="currency" className = "text-sm text-gray-600">Status</Label>
                    <Select value={data.status} onValueChange={handlestatuschange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sell">For Sell</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                    </Select>
                </div>

                {data.status === 'rent' && (
                <div className="space-y-2">
                    <Label htmlFor="RentType" className = "text-sm text-gray-600">Rent Type</Label>
                    <Select value={data.rental_type} onValueChange={handleRentalTypechange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Rent Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Mounthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                )}
                                    <div className="space-y-2">
                                    <Label htmlFor="condition" className = "text-sm text-gray-600">Condition</Label>
                                    <Select value={data.condition} onValueChange={handleConditionchange}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select Condition" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="used">Used</SelectItem>
                                        <SelectItem value="new">New</SelectItem>
                                      </SelectContent>
                                    </Select>
                                   
                                        </div>
                        
                                  <div className="space-y-2">
                                    <Label htmlFor="currency" className = "text-sm text-gray-600">Currency</Label>
                                    <Select value={data.currency} onValueChange={handlecurrencychange}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                        <SelectItem value="SYP">SYP (Syrian Pound)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                        <div className="space-y-2">
                        <Label htmlFor="price" className = "text-sm text-gray-600">Price</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            value={data.pricefrom}
                            onChange={(e) => setData("pricefrom", e.target.value)}
                            placeholder="From"
                            type="number"
                            className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                          />
                          <Input
                            value={data.priceto}
                            onChange={(e) => setData("priceto", e.target.value)}
                            placeholder="To"
                            type="number"
                            className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                          />
                        </div>
                      </div>
                      {/* Body Type */}
                      <div className="space-y-2">
                    <Label htmlFor="bodytype" className="text-sm text-gray-600">Body Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {bodyTypes.map((type) => (
                        <Button
                            type = "button"
                            key={type.id}
                            variant={selectedBodyType === type.id ? "default" : "outline"}
                            className={`flex flex-col items-center justify-center h-20 p-2 ${
                            selectedBodyType === type.id ? "bg-blue-500 text-white hover:bg-blue-600" : ""
                            }`}
                            onClick={() => toggleBodyType(type.id)}
                        >
                            {type.icon}
                            <span className="mt-1 text-xs">{type.label}</span>
                        </Button>
                        ))}
                    </div>
                    </div>


                      <div className="space-y-2">
                        <Label htmlFor="Mileage" className = "text-sm text-gray-600">Mileage</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            value={data.mileagefrom}
                            onChange={(e) => setData("mileagefrom", e.target.value)}
                            placeholder="From"
                            type="number"
                            className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                          />
                          <Input
                            value={data.mileageto}
                            onChange={(e) => setData("mileageto", e.target.value)}
                            placeholder="To"
                            type="number"
                            className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                          />
                        </div>
                      </div>
                                <div className="space-y-2">
                            <Label htmlFor="location" className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            Location
                            </Label>
                        <Input id="location" placeholder="City, Region"
                                   value={data.location}
                                   onChange={(e) => setData("location", e.target.value)} />
                                
                        </div>
                         {/* Doors */}
                                  <div className="space-y-2">
                                    <Label htmlFor="doors" className = "text-sm text-gray-600">Doors</Label>
                                    <Select onValueChange={(value) => setData("doors", value)} value={data.doors}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select number of doors" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {doorOptions.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option} doors
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                   
                                  </div>
                        
                                  {/* Cylinders */}
                                  <div className="space-y-2">
                              <Label htmlFor="cylinders" className="flex items-center gap-2 text-sm text-gray-600">
                                <Wrench className="h-4 w-4" />
                                Cylinders
                              </Label>
                              <Select onValueChange={(value) => setData({ ...data, cylinders: value, engine: "", fuel: "" })}
                                    value={data.cylinders}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select cylinders" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cylinderOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option === "Electric" ? (
                                        <div className="flex items-center">
                                          <Zap className="h-4 w-4 mr-2" />
                                          Electric
                                        </div>
                                      ) : (
                                        `${option} cylinders`
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                        
                            <div className="space-y-2">
                              <Label htmlFor="engine" className="flex items-center gap-2 text-sm text-gray-600">
                                <Car className="h-4 w-4" />
                                Engine (cc)
                              </Label>
                              <Input
                                id="engine"
                                type="number"
                                placeholder="Vehicle Engine in cc"
                                value={data.engine}
                                onChange={(e) => setData({ ...data, engine: e.target.value })}
                                disabled={isElectric} // Disable if Electric
                                className={isElectric ? "opacity-50 cursor-not-allowed" : ""}
                              />
                              
                            </div>
                                  {/* Transmission */}
                                  <div className="space-y-2">
                                    <Label htmlFor="transmission" className = "text-sm text-gray-600">Transmission</Label>
                                    <Select onValueChange={(value) => setData("transmission", value)} value={data.transmission}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select transmission type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {transmissionOptions.map((option) => (
                                          <SelectItem key={option} value={option.toLowerCase()}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                               
                                  </div>
                        
                                  {/* Fuel Type */}
                                  <div className="space-y-2">
                              <Label htmlFor="fuel" className="flex items-center gap-2 text-sm text-gray-600">
                                <Fuel className="h-4 w-4" />
                                Fuel Type
                              </Label>
                              <Select
                                onValueChange={(value) => setData({ ...data, fuel: value })}
                                disabled={isElectric}
                                value={data.fuel} // Disable if Electric
                              >
                                <SelectTrigger className={isElectric ? "opacity-50 cursor-not-allowed" : ""}>
                                  <SelectValue placeholder="Select fuel type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fuelOptions.map((option) => (
                                    <SelectItem key={option} value={option.toLowerCase()}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                         
                                  </div>
                        
                                  {/* Color */}
                                    <div className="md:col-span-2 space-y-3">
                                    <Label className="flex items-center gap-2 text-sm text-gray-600">
                                      <Palette className="h-4 w-4" />
                                      Color
                                    </Label>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                                      {colorOptions.map((color) => {
                                        const isSelected = selectedColor === color.value;
                                        return (
                                          <div
                                            key={color.value}
                                            className="flex flex-col items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleColorChange(color.value)} 
                                          >
                                            <div
                                              className={cn(
                                                "w-8 h-8 sm:w-10 sm:h-10 rounded-full border relative",
                                                color.value === "white" ? "border-gray-300" : "border-transparent",
                                                isSelected ? "ring-2 ring-primary ring-offset-2" : "",
                                              )}
                                              style={{ backgroundColor: color.hex }}
                                            >
                                              {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                  <Check
                                                    className={cn(
                                                      "h-4 w-4 sm:h-5 sm:w-5",
                                                      ["white", "yellow", "beige"].includes(color.value) ? "text-black" : "text-white",
                                                    )}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                            <span className="text-[10px] sm:text-xs">{color.label}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  
                                    </div>
                    </div>
                 
                  </div>
                  
                                {/* Footer */}
                                <SheetFooter className="p-4 mt-auto">
                                    <div className="flex w-full gap-2">
                                    <Button
                                      variant="ghost"
                                      className="flex-1"
                                      onClick={() => {
                                        const sheet = document.querySelector('[data-state="open"]')
                                        if (sheet) {
                                          ;(sheet).click()
                                        }
                                        localStorage.removeItem('filterSheetOpen');
                                        setIsOpen(false);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button className="flex-1 relative bg-primary text-white hover:bg-primary-hover" type="submit" disabled={isDataEmpty} onClick={submit}>
                                      Submit
                            {count > 0 && (
                              <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1 border border-slate-200">
                                {count}
                              </span>
                            )}
                          </Button>
                                  </div>
                                  </SheetFooter>
                </div>
                
              </SheetContent>
             
            </Sheet>
            
    </>
  )
}

export default FilterButton
