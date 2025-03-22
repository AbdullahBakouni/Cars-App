



import { useState, useRef } from "react";

import {
  Car,
  Upload,
  X,
  MapPin,
  DollarSign,
  Phone,
  MessageSquare,
  Tag,
  ConeIcon as Coupe,
  SirenIcon as Sedan,
  CarIcon as Suv,
  CarIcon as Hatchback,
  CaravanIcon as Wagon,
  Truck,
  Bus,
  Wrench,
  Zap,
  Fuel,
  Palette,
  Building2,
  ImageIcon,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Head, useForm } from "@inertiajs/react";
import carData from "../cars";



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
]

export default function CreateCar() {
    const [images, setImages] = useState([])
    const [imageUrls, setImageUrls] = useState([])
    const [selectedBrand, setSelectedBrand] = useState("")
    const [tags, setTags] = useState([])
    const [model, setModel] = useState("")
    const [year, setYear] = useState("")
    const [tagInput, setTagInput] = useState("")
    const [selectedBodyType, setSelectedBodyType] = useState("")
    const [selectedColor, setSelectedColor] = useState("")
    const [companyLogo, setCompanyLogo] = useState(null)
    const [companyLogoUrl, setCompanyLogoUrl] = useState("")
    const fileInputRef = useRef(null)
    const companyLogoInputRef = useRef(null)
    const { data, setData, post, errors } = useForm({
      title: '',
      description: '',
      brand: '',
      model: '',
      year: '',
      location: '',
      price: '',
      phone: '',
      whatsapp: '',
      company_name: '',
      company_logo: null,
      body_type: '',
      doors: '',
      cylinders: '',
      transmission: '',
      fuel: '',
      color: '',
      images: [],
      tags: [],
  });

  const submit = (e) => {
    e.preventDefault();
    console.log(data);
    post(route("car.store"));
  };

    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      setData("images", [...data.images, ...files]);
  
      const urls = files.map((file) => URL.createObjectURL(file));
      setImageUrls([...imageUrls, ...urls]);
    }
  
    const handleCompanyLogoUpload = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
    
        // Update `company_logo` in `useForm` data
        setData("company_logo", file);
    
        // Revoke previous URL to prevent memory leaks
        if (companyLogoUrl) {
          URL.revokeObjectURL(companyLogoUrl);
        }
    
        // Create and store preview URL
        const url = URL.createObjectURL(file);
        setCompanyLogoUrl(url);
      }
    }
  
    const removeCompanyLogo = () => {
      if (companyLogoUrl) {
        URL.revokeObjectURL(companyLogoUrl)
      }
      setCompanyLogo(null)
      setCompanyLogoUrl("")
    }
  
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
  
    const handleCompanyLogoDragOver = (e) => {
      e.preventDefault()
    }
  
    const handleCompanyLogoDrop = (e) => {
      e.preventDefault()
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        setCompanyLogo(file)
  
        // Revoke previous URL to prevent memory leaks
        if (companyLogoUrl) {
          URL.revokeObjectURL(companyLogoUrl)
        }
  
        // Create URL for preview
        const url = URL.createObjectURL(file)
        setCompanyLogoUrl(url)
      }
    }
  
    const removeImage = (index) => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(imageUrls[index])
  
      setImages((prev) => prev.filter((_, i) => i !== index))
      setImageUrls((prev) => prev.filter((_, i) => i !== index))
    }
  
    const handleTagAdd = () => {
      if (tagInput && !data.tags.includes(tagInput)) {
        setData("tags", [...data.tags, tagInput]) // Add the tag to `data.tags`
        setTagInput('') // Clear input after adding
      }
    }
  
    const removeTag = (tag) => {
        setData("tags", data.tags.filter(t => t !== tag)) // Remove tag from `data.tags`
    }
  
    const handleTagKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleTagAdd()
      }
    }
  
    const getBodyTypeIcon = (value) => {
      const bodyType = bodyTypes.find((type) => type.value === value)
      if (bodyType) {
        const Icon = bodyType.icon
        return <Icon className="h-5 w-5" />
      }
      return <Car className="h-5 w-5" />
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
      setData((prevData) => ({
        ...prevData,
        brand: value, // حفظ القيمة المختارة داخل data.brand
      }));
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

  return (
    <>
    <Head title="Sell You Car" />
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
          <h1 className="text-xl md:text-2xl font-bold text-center">Sell Your Car</h1>
        </div>

        {/* Image Upload Section */}
        <form onSubmit={submit} className="xs-range:text-xs xs-range:space-y-2">
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
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-md overflow-hidden border">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Car image ${index + 1}`}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
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
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. 2018 Toyota Camry in excellent condition" 
              value={data.title}
              onChange={(e) => setData("title", e.target.value)}/>
               {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

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

          {/* Brand and Model */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select onValueChange={handleBrandChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
              {carData.data.map((brand) => (
                  <SelectItem key={brand.id} value={brand.name}>
                    <div className="flex items-center gap-4">
                      <img
                        src={brand.image || "/placeholder.svg"}
                        alt={`${brand.name} logo`}
                        width={30}
                        height={15}
                        className="object-contain"
                      />
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

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" placeholder="Year of manufacture"  value={data.year}
            onChange={(e) => setData("year", e.target.value)} />
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
            <Label htmlFor="price" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price (SYP)
            </Label>
            <Input id="price" type="number" placeholder="Price in Syrian Pounds" 
             value={data.price}
             onChange={(e) => setData("price", e.target.value)}
            />
             {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input id="phone" placeholder="Your contact number" 
             value={data.phone}
             onChange={(e) => setData("phone", e.target.value)}/>
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </Label>
            <Input id="whatsapp" placeholder="WhatsApp number (if different)"
             value={data.whatsapp}
             onChange={(e) => setData("whatsapp", e.target.value)} />
              {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
          </div>

          {/* Company Information */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border xs-range:rounded-sm">
            <div className="space-y-2">
              <Label htmlFor="company-logo" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Logo
              </Label>
              <div
                className={cn(
                  "w-24 h-24 mx-auto md:mx-0 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden xs-range:w-14 xs-range:h-12",
                  companyLogoUrl ? "border-0" : "border-muted-foreground/30",
                )}
                onDragOver={handleCompanyLogoDragOver}
                onDrop={handleCompanyLogoDrop}
                onClick={() => companyLogoInputRef.current?.click()}
              >
                {companyLogoUrl ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={companyLogoUrl || "/placeholder.svg"}
                      alt="Company logo"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                      <button
                        className="hidden group-hover:flex bg-destructive text-destructive-foreground rounded-full p-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeCompanyLogo()
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                )}
                <input
                  ref={companyLogoInputRef}
                  id="company-logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCompanyLogoUpload}
                />
              </div>
              <p className="text-xs text-center md:text-left text-muted-foreground">Click or drag to upload logo</p>
              {/* {errors.company_logo && <p className="text-red-500 text-sm mt-1">{errors.company_logo}</p>} */}
            </div>

            <div className="space-y-2 flex flex-col justify-center">
              <Label htmlFor="company-name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name
              </Label>
              <Input id="company-name" placeholder="Your company name (if applicable)"
              value = {data.company_name}
              onChange={(e) => setData("company_name", e.target.value)} 
              />
               {/* {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>} */}
            </div>
          </div>

          {/* Body Type */}
         {/* Body Type */}
         <div className="md:col-span-2 space-y-3">
            <Label>Body Type</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {bodyTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedBodyType === type.value
                return (
                  <Card
                    key={type.value}
                    className={cn(
                      "cursor-pointer hover:bg-muted transition-colors relative",
                      isSelected ? "ring-2 ring-primary bg-primary/5" : "",
                    )}
                    onClick={() => setSelectedBodyType(type.value)}
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
          </div>

          {/* Doors */}
          <div className="space-y-2">
            <Label htmlFor="doors">Doors</Label>
            <Select onValueChange={(value) => setData("doors", value)}>
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
              {/* Show electric icon or cylinder icon based on selection */}
              <Wrench className="h-4 w-4" />
              Cylinders
            </Label>
            <Select onValueChange={(value) => setData("cylinders", value)}>
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

          {/* Transmission */}
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Select onValueChange={(value) => setData("transmission", value)}>
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
            <Select onValueChange={(value) => setData("fuel", value)}>
              <SelectTrigger>
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
                const isSelected = selectedColor === color.value
                return (
                  <div
                    key={color.value}
                    className="flex flex-col items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedColor(color.value)}
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
            </div>

          {/* Tags */}
          <div className="md:col-span-2 space-y-4">
            <Label htmlFor="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
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
        <Button className="w-full md:w-auto mt-5 xs-range:mt-2" size="lg"  type="submit">
          Submit Listing
        </Button>
        </form>
      </div>
    </div>
    </>
  )
}

