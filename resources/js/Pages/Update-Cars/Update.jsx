



import { useState, useRef, useEffect } from "react";

import {
  Car,
  Upload,
  X,
  MapPin,
  DollarSign,
  Tag,
  CarFront as Coupe,
  CarTaxiFront  as Sedan,
  CarIcon as Suv,
  CarIcon as Hatchback,
  CaravanIcon as Wagon,
  Truck,
  Bus,
  Wrench,
  Zap,
  Fuel,
  Palette,
  Check,
  LogIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Head,useForm } from "@inertiajs/react";
import carData from "../cars";
import { Dialog, DialogContent } from "@/Components/ui/dialog";
import { LazyLoadImage } from "react-lazy-load-image-component"
import 'react-lazy-load-image-component/src/effects/blur.css';

const bodyTypes = [
  { value: "coupe", label: "Coupe", icon: Coupe },
  { value: "sedan", label: "Sedan", icon: Sedan },
  { value: "suv", label: "SUV", icon: Suv },
  { value: "hatch", label: "Hatchback", icon: Hatchback },
  { value: "wagon", label: "Wagon", icon: Wagon },
  { value: "pickup", label: "Pickup", icon: Truck },
  { value: "minivan", label: "MiniVan", icon: Bus },
  { value: "commercial", label: "Commercial", icon: Truck },
  { value: "other", label: "Other", icon: Car },
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

export default function Update({auth,car,hasVerifiedEmail}) {
  const { data, setData, post, errors, processing } = useForm({
    description: car?.description || "",
    brand: car?.brand || "",
    model: car?.model || "",
    year: car?.year?.toString() || "",
    location: car?.location || "",
    price: car?.price || "",
    body_type: car?.body_type || "",
    mileage: car?.mileage || "",
    currency: car?.currency || "",
    status: car?.status || "",
    rental_type:car?.rental_type || "",
    condition:car?.condition || "",
    doors: car?.doors?.toString() || "",
    cylinders: car?.cylinders?.toString() || "",
    engine: car?.engine || "",
    transmission: car?.transmission?.toString() || "",
    fuel: car?.fuel?.toLowerCase() || "",
    color: car?.color || "",
    images: car?.images || [],
    new_images: [],
    removed_images: [],
    tags: car?.tags || [],
    removed_tags:[],
    _method: "PUT",
});
    
    const [images, setImages] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [tagInput, setTagInput] = useState("");
    const [selectedBodyType, setSelectedBodyType] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [currency, setCurrency] = useState("SYP");
    const [previousEngine, setPreviousEngine] = useState("");
    const [previousFuel, setPreviousFuel] = useState("");
    const fileInputRef = useRef(null);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const isElectric = data.cylinders === "Electric";
  useEffect(() => {
    if (!car) return;

    const matchedBrand = carData.data.find((brand) => brand.name === car.brand);
    setData((prevData) => ({
        ...prevData,
        description: car.description,
        brand: car.brand,
        year: car.year.toString(),
        currency: car.currency,
        body_type: car.body_type,
        doors: car.doors.toString(),
        cylinders: car.cylinders.toString(),
        transmission: car.transmission.toString(),
        fuel: car.fuel?.toLowerCase() ?? "",
        color: car.color,
        tags: car.tags,
        status: car.status,
        rental_type:car.rental_type,
        condition:car.condition,
    }));
    setSelectedBodyType(car.body_type || null);
    setSelectedBrand(matchedBrand || null);
    setSelectedColor(car.color || null);

    if (car.images && car.images.length > 0) {
      setImageUrls(
        car.images.map((img) => ({
            id: img.id, // Keep the image ID
            url: `/storage/${img.image_path}`, // Construct the full URL
        }))
    );
    }
}, [car]);

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  const urls = files.map((file) => URL.createObjectURL(file));

   const newImages = files.map((file, index) => ({
    id: Date.now() + index,  // A simple way to generate a unique ID based on timestamp and index
    url: urls[index], 
    file: file,
    isNew: true,         // The generated URL for the image preview
  }));

  // Update the imageUrls state by appending the new images to the existing ones
  setImageUrls((prev) => [...prev, ...newImages]);
  setData("new_images", [...data.new_images, ...files]);
};
   
  
    const handleDragOver = (e) => {
      e.preventDefault()
    }
  
    const handleDrop = (e) => {
      e.preventDefault()
      if (e.dataTransfer.files) {
        const newFiles = Array.from(e.dataTransfer.files)
        setImages((prev) => [...prev, ...newFiles])
  
        // Create URLs for preview
        const newUrls = newFiles.map((file) => URL.createObjectURL(file))
        setImageUrls((prev) => [...prev, ...newUrls])
      }
    }
  
    const removeImage = (index,imageId) => {
      const image = imageUrls[index];
      if (image.isNew === true) {
        // If it's a new image, just remove it from the UI and new_images state
        setData(prevData => {
          const newImages = prevData.new_images.filter((file) => file !== image.file);
          return {
            ...prevData,
            new_images: newImages
          };
        }
      );
      } else {
              setData("removed_images", [...data.removed_images, imageId]);
          }
      

      // Remove from the imageUrls state (UI state)
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
    };
  
    const handleTagAdd = () => {
      if (tagInput.trim() && !data.tags.some(tag => tag.name === tagInput)) {
        const newTag = {
          id: Date.now(), // Temporary unique ID
          name: tagInput.trim(), // Store the tag name
          isNew: true // Mark it as new (optional)
        };
    
        setData("tags", [...data.tags, newTag]); // Add to the tags list
        setTagInput(""); // Clear input
      }
    };
  
    const removeTag = (tagId) => {
      const tagToRemove = data.tags.find(tag => tag.id === tagId);
    
      if (tagToRemove) {
        if (!tagToRemove.isNew) {
          // If it's an existing tag, add to removed_tags
          setData("removed_tags", [...data.removed_tags, tagId]);
        }
    
        // Remove from the tags list
        setData("tags", data.tags.filter(tag => tag.id !== tagId));
      }
    };
    
  
    const handleTagKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleTagAdd()
      }
    }
  
    const getSelectedBodyTypeLabel = () => {
      if (!selectedBodyType) return null
      const bodyType = bodyTypes.find((type) => type.value === selectedBodyType)
      if (bodyType) {
        const Icon = bodyType.icon
        return (
          <div className="flex items-center gap-2 mt-2 p-2 bg-primary/10 rounded-md">
            <Icon className="h-5 w-5" />
            <span>Selected: {bodyType.label}</span>
          </div>
        )
      }
      return null
    }
    const handleBrandChange = (value) => {
      const selected = carData.data.find((brand) => brand.name === value);
      setSelectedBrand(selected);
      setData("brand", selected.name);
    };

    const getSelectedColorDisplay = () => {
      if (!selectedColor) return null
      const color = colorOptions.find((c) => c.value === selectedColor)
      if (color) {
        return (
          <div className="flex items-center gap-2 mt-2 p-2 bg-primary/10 rounded-md">
            <div
              className={cn(
                "w-5 h-5 rounded-full border",
                color.value === "white" ? "border-gray-300" : "border-transparent",
              )}
              style={{ backgroundColor: color.hex }}
            />
            <span>Selected: {color.label}</span>
          </div>
        )
      }
      return null
    }

    const handlecurrencychange = (value) => {
      setCurrency(value);
      setData('currency', value);
    }

    const handlestatuschange = (value) => {
      setData('status', value);
    }
    
    const handleRentalTypechange = (value) => {
      setData("rental_type", value);
    }

    const handleConditionchange = (value) => {
      setData("condition", value);  
    }
    const handleColorChange = (colorValue) => {
      setSelectedColor(colorValue); // Update the selected color
      setData("color", colorValue);   // Update form data
    };
    const handleBodyTypeChange = (value) => {
      setSelectedBodyType(value);  // Update local state for body type
      setData('body_type', value); // Update form data
    };
    const handlePriceChange = (e) => {
      let value = e.target.value;

      // Remove all non-numeric characters
      value = value.replace(/\D/g, '');
  
      // Format the number with dots as thousand separators
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
      // Update state with the formatted value
      setData("price", value);
    }
    const handleMileageChange = (e) => {
      // Get the value from input field
      let value = e.target.value;
  
      // Remove all non-numeric characters (to prevent letters or other symbols)
      value = value.replace(/\D/g, '');
  
      // Format the number with commas
      if (value.length > 3) {
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
  
      // Set the formatted value
      setData({
        ...data,
        mileage: value,
      });
    };
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i);

    useEffect(() => {
      // Compare the length of removed_images with car.images
      if (data.removed_images.length === car.images.length - 1) {
        setIsButtonDisabled(true);  // Disable the button if removed_images is greater than or equal to car.images
      } else {
        setIsButtonDisabled(false); // Enable the button otherwise
      }
    }, [data.removed_images, car.images.length]);

    const submit = (e) => {
      e.preventDefault();
      if (auth.user && hasVerifiedEmail) {
        post(route("cars.update", car.id), data, {
        });
      } else {
        setLoginDialogOpen(true);
      }
    };

  return (
    <>
    <Head title={"Update Your Car" } />
    <div className="bg-gray-100 xs-s-range:min-h-[334vh] xs-range:text-xs w-full xs-range:min-h-[270vh] min-h-screen">
      <div className="max-w-4xl mx-auto p-4 space-y-8 xs-range:p-2 xs-range:space-y-0 xs-range:max-w-[400px] xs-range:h-full overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col items-center justify-center space-y-2 mb-8 xs-range:mb-4">
        <div className="flex justify-center mb-4 xs-range:mb-2">
            <div className="logo-container">
              <span className="text-3xl font-bold">
                <span className="text-blue-600">m</span>oto<span className="text-blue-600">.</span>com
              </span>
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-center">Update Your Car Details</h1>
        </div>

        {/* Image Upload Section */}
        <form onSubmit={submit} className="xs-range:text-xs xs-range:space-y-2"  name="form-to-create-car"
        encType="multipart/form-data" >
        <div className="space-y-4">
          <Label htmlFor="images">Car Images</Label>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">Drag and drop your images here or click to browse</p>
            <p className="text-xs text-muted-foreground">Upload multiple images of your car</p>
            <input
              ref={fileInputRef}
              id="images"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
          </div>

          {/* Image Preview */}
          {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {imageUrls.map((image, index) => ( // `image` is now the object with `id` and `url`
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-md overflow-hidden border">
                <LazyLoadImage
                src={image.url || "/placeholder.svg"}
                alt={`Car image ${index + 1}`}
                width={200}
                height={200}
                className="object-cover h-full w-full"
                effect="blur" // Optional effect for lazy loading
                />
              </div>
              <button
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => removeImage(index,image.id)}
                disabled={isButtonDisabled} // Pass the actual image ID instead of index
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
)}

        </div>

        {/* Car Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs-range:gap-3 xs-range:text-xs">
          {/* Title and Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your car, its condition, features, etc."
                className="min-h-[120px] xs-range:min-h-[60px]"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Status</Label>
            <Select value={data.status} onValueChange={handlestatuschange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sell">For Sell</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>

                {data.status === 'rent' && (
                    <div className="space-y-2">
                      <Label htmlFor="RentType">Rent Type</Label>
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
                      {errors.rental_type && <p className="text-red-500 text-sm mt-1">{errors.rental_type}</p>}
                    </div>
                    )}

                    
                <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={data.condition} onValueChange={handleConditionchange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
            {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                </div>

                <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={data.currency} onValueChange={handlecurrencychange}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                <SelectItem value="SYP">SYP (Syrian Pound)</SelectItem>
              </SelectContent>
            </Select>
            {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price  ({data.currency})
            </Label>
            <Input id="price" type="text" placeholder={`Price in ${currency}`} 
             value={data.price}
             onChange={handlePriceChange}
            />
             {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
          {/* Brand and Model */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select onValueChange={handleBrandChange} value={selectedBrand?.name}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select brand">
                            {selectedBrand ? (
                                <div className="flex items-center gap-4">
                                  {selectedBrand.name !== "Others" && (
                                    <LazyLoadImage
                                    src={selectedBrand.image || "/placeholder.svg"}
                                    alt={`${selectedBrand.name} logo`}
                                    className="object-contain w-[40px] h-[20px]"
                                    effect="blur"
                                    />
                                  )}
                                    <span>{selectedBrand.name}</span>
                                </div>
                            ) : (
                                "Select brand"
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {carData.data.map((brand) => (
                            <SelectItem key={brand.id} value={brand.name}>
                                <div className="flex items-center gap-4">
                                {brand.name !== "Others" && (
                                    <LazyLoadImage
                                    src={brand.image || "/placeholder.svg"}
                                    alt={`${brand.name} logo`}
                                    className="object-contain w-[40px] h-[20px]"
                                    effect="blur"
                                    />
                                )}
                                    <span>{brand.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" placeholder="Enter car model" value={data.model}
              onChange={(e) => setData("model", e.target.value)} />
                {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
          </div>
      {/* Year Selection */}
      <div className="space-y-2">
        <Label htmlFor="year">Year</Label>
        <Select value={data.year} onValueChange={(value) => setData("year", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
      </div>

          {/* Location and Price */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input id="location" placeholder="City, Region"
             value={data.location}
             onChange={(e) => setData("location", e.target.value)} />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Mileage (km)
            </Label>
            <Input
              id="mileage"
              type="text"
              placeholder="Vehicle mileage in kilometers"
              value={data.mileage}
              onChange={handleMileageChange}
            />
              {errors.mileage && <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>}
          </div>
          
         {/* Body Type */}
         <div className="md:col-span-2 space-y-3">
            <Label>Body Type</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {bodyTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedBodyType === type.value;
                return (
                  <Card
                    key={type.value}
                    className={cn(
                      "cursor-pointer hover:bg-muted transition-colors relative",
                      isSelected ? "ring-2 ring-primary bg-primary/5" : "",
                    )}
                    onClick={() => handleBodyTypeChange(type.value)}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-2 w-2 sm:h-3 sm:w-3" />
                      </div>
                    )}
                    <CardContent className="p-2 sm:p-3 text-center">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm">{type.label}</span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {getSelectedBodyTypeLabel()}
            {errors.body_type && <p className="text-red-500 text-sm mt-1">{errors.body_type}</p>}
          </div>

          {/* Doors */}
          <div className="space-y-2">
            <Label htmlFor="doors">Doors</Label>
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
            {errors.doors && <p className="text-red-500 text-sm mt-1">{errors.doors}</p>}
          </div>

          {/* Cylinders */}
          <div className="space-y-2">
      <Label htmlFor="cylinders" className="flex items-center gap-2">
        <Wrench className="h-4 w-4" />
        Cylinders
      </Label>
      <Select  onValueChange={(value) => {
    if (value === "Electric") {
      // احفظ القيم قبل المسح
      setPreviousEngine(data.engine);
      setPreviousFuel(data.fuel);

      // امسح القيم وقم بتحديث isElectric
      setData({ 
        ...data, 
        cylinders: value, 
        engine: "", 
        fuel: "", 
        isElectric: true 
      });
    } else {
      // استرجع القيم السابقة عند اختيار محرك غير كهربائي
      setData({ 
        ...data, 
        cylinders: value, 
        engine: previousEngine, 
        fuel: previousFuel, 
        isElectric: false 
      });
    }
  }} 
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
      {errors.cylinders && <p className="text-red-500 text-sm mt-1">{errors.cylinders}</p>}
    </div>

    <div className="space-y-2">
      <Label htmlFor="engine" className="flex items-center gap-2">
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
      {errors.engine && <p className="text-red-500 text-sm mt-1">{errors.engine}</p>}
    </div>
          {/* Transmission */}
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
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
            {errors.transmission && <p className="text-red-500 text-sm mt-1">{errors.transmission}</p>}
          </div>

          {/* Fuel Type */}
          <div className="space-y-2">
      <Label htmlFor="fuel" className="flex items-center gap-2">
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
      {errors.fuel && <p className="text-red-500 text-sm mt-1">{errors.fuel}</p>}
          </div>

          {/* Color */}
            <div className="md:col-span-2 space-y-3">
            <Label className="flex items-center gap-2">
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
            {getSelectedColorDisplay()}
            {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
            </div>

           
          {/* Tags */}
          <div className="md:col-span-2 space-y-4">
            <Label htmlFor="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                  {tag.name || "New Tag"}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag.id)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags (e.g., leather seats, sunroof)"
              />
              <Button type="button" onClick={handleTagAdd} variant="outline">
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter to add a tag</p>
            {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
          </div>
        </div>
        {/* Submit Button */}
        <Button className="w-full md:w-auto mt-5 xs-range:mt-2" size="lg"  disabled={processing}>
                Update Your Car 
        </Button>
        </form>
      </div>
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="rounded-full bg-rose-100 p-3 mb-4">
                    <LogIn className="h-6 w-6 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Login Required</h2>
                  <p className="text-center text-gray-500 mb-6">You need to login to Rate cars.</p>
                  <p className="text-center text-gray-500 mb-6">Pleace Click on Menu Button</p>
                </div>
              </DialogContent>
            </Dialog>
    </div>
    </>
  )
}

