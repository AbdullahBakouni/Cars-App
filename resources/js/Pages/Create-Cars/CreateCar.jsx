import { useState, useRef, useEffect } from "react";

import {
    Car,
    Upload,
    X,
    MapPin,
    DollarSign,
    Phone,
    Tag,
    CarFront as Coupe,
    CarTaxiFront as Sedan,
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
    LogIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import carData from "../cars";
import { Dialog, DialogContent } from "@/Components/ui/dialog";
import { Inertia } from "@inertiajs/inertia";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
];

const doorOptions = ["2", "3", "4", "5"];
const cylinderOptions = ["Electric", "2", "3", "4", "6", "8", "10", "12", "16"];
const transmissionOptions = ["Automatic", "Manual"];
const fuelOptions = ["Diesel", "Petrol", "Electric", "Hybrid", "Other"];
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
];

export default function CreateCar({ auth, hasVerifiedEmail }) {
    const { company_logo } = usePage().props;
    const { company_name } = usePage().props;
    const { company_location } = usePage().props;
    const { company_id } = usePage().props;
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const isCompanyDataAvailable = company_name && company_location;
    const { data, setData, post, errors, processing } = useForm({
        title: "",
        description: "",
        brand: "",
        model: "",
        year: "",
        location: "",
        price: "",
        phone: "",
        company_name: company_name || "",
        company_location: company_location || "",
        company_logo: company_logo || null,
        company_id: company_id || null,
        body_type: "",
        mileage: "",
        currency: "",
        status: "",
        rental_type: "",
        condition: "",
        doors: "",
        cylinders: "",
        engine: "",
        transmission: "",
        fuel: "",
        color: "",
        images: [],
        tags: [],
    });

    useEffect(() => {
        // Show the dialog only if there are any errors
        if (Object.keys(errors).length > 0) {
            setShowErrorDialog(true);
        }
    }, [errors]);
    useEffect(() => {
        if (!isCompanyDataAvailable) return;

        if (!companyLogoUrl) {
            setCompanyLogoUrl(company_logo ? `/storage/${company_logo}` : null);
        }
    }, [isCompanyDataAvailable]);
    const [images, setImages] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [tagInput, setTagInput] = useState("");
    const [selectedBodyType, setSelectedBodyType] = useState("");
    const [IsElectric, setIsElectric] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [companyLogo, setCompanyLogo] = useState(null);
    const [companyLogoUrl, setCompanyLogoUrl] = useState("");

    const [currency, setCurrency] = useState("SYP");
    const fileInputRef = useRef(null);
    const companyLogoInputRef = useRef(null);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const isElectric = data.cylinders === "Electric";
    useEffect(() => {
        // تحقق من وجود معلومات الشركة
        if (company_id && company_name && company_logo && company_location) {
            // يتم إلغاء حفظ البيانات عند التصفح عبر "التاريخ" أو العودة للوراء
            const handleBeforeUnload = () => {
                // إرسال طلب لحذف البيانات من الجلسة
                Inertia.post(route("clearCompanySession"));
            };

            // تفعيل المستمع لحدث مغادرة الصفحة أو العودة
            window.addEventListener("beforeunload", handleBeforeUnload);

            // تنظيف المستمع عند مغادرة الصفحة
            return () => {
                window.removeEventListener("beforeunload", handleBeforeUnload);
            };
        }

        // إذا كانت بيانات الشركة غير موجودة، لا تنفذ أي شيء
    }, [company_id, company_name, company_logo, company_location]);

    const handleLogoClick = () => {
        if (company_id && company_name && company_logo && company_location) {
            Inertia.post(route("clearCompanySession"));

            Inertia.get("/");
        } else {
            Inertia.get("/");
        }
    };
    useEffect(() => {
        if (company_id) {
            setData("company_id", company_id);
            setData("company_logo", null);
        }
    }, [company_id]);

    const submit = (e) => {
        e.preventDefault();
        if (auth.user && hasVerifiedEmail) {
            post(route("car.store"));
        } else {
            setLoginDialogOpen(true);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setData("images", [...data.images, ...files]);

        const urls = files.map((file) => URL.createObjectURL(file));
        setImageUrls([...imageUrls, ...urls]);
    };

    const handleCompanyLogoUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Update `company_logo` in `useForm` data
            setData("company_logo", file);

            // Revoke previous URL to prevent memory leaks
            if (companyLogoUrl) {
                URL.revokeObjectURL(companyLogoUrl);
            }
            const url = URL.createObjectURL(file);
            setCompanyLogoUrl(url);
        }
    };

    const removeCompanyLogo = () => {
        if (companyLogoUrl) {
            URL.revokeObjectURL(companyLogoUrl);
        }
        setCompanyLogo(null);
        setCompanyLogoUrl("");
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files);
            setImages((prev) => [...prev, ...newFiles]);

            // Create URLs for preview
            const newUrls = newFiles.map((file) => URL.createObjectURL(file));
            setImageUrls((prev) => [...prev, ...newUrls]);
        }
    };

    const handleCompanyLogoDragOver = (e) => {
        e.preventDefault();
    };

    const handleCompanyLogoDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setCompanyLogo(file);

            // Revoke previous URL to prevent memory leaks
            if (companyLogoUrl) {
                URL.revokeObjectURL(companyLogoUrl);
            }

            // Create URL for preview
            const url = URL.createObjectURL(file);
            setCompanyLogoUrl(url);
        }
    };

    const removeImage = (index) => {
        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(imageUrls[index]);

        // Remove the image from the preview list
        setImageUrls((prev) => prev.filter((_, i) => i !== index));

        // Remove the image from the `useForm` data
        const updatedImages = data.images.filter((_, i) => i !== index);
        setData("images", updatedImages); // Update the `images` field in `useForm`
    };

    const handleTagAdd = () => {
        if (tagInput && !data.tags.includes(tagInput)) {
            setData("tags", [...data.tags, tagInput]); // Add the tag to `data.tags`
            setTagInput(""); // Clear input after adding
        }
    };

    const removeTag = (tag) => {
        setData(
            "tags",
            data.tags.filter((t) => t !== tag)
        ); // Remove tag from `data.tags`
    };

    const handleTagKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleTagAdd();
        }
    };

    const getSelectedBodyTypeLabel = () => {
        if (!selectedBodyType) return null;
        const bodyType = bodyTypes.find(
            (type) => type.value === selectedBodyType
        );
        if (bodyType) {
            const Icon = bodyType.icon;
            return (
                <div className="flex items-center gap-2 mt-2 p-2 bg-primary/10 rounded-md">
                    <Icon className="h-5 w-5" />
                    <span>Selected: {bodyType.label}</span>
                </div>
            );
        }
        return null;
    };
    const handleBrandChange = (value) => {
        const selected = carData.data.find((brand) => brand.name === value);
        setSelectedBrand(selected);
        setData("brand", selected.name);
    };

    const getSelectedColorDisplay = () => {
        if (!selectedColor) return null;
        const color = colorOptions.find((c) => c.value === selectedColor);
        if (color) {
            return (
                <div className="flex items-center gap-2 mt-2 p-2 bg-primary/10 rounded-md">
                    <div
                        className={cn(
                            "w-5 h-5 rounded-full border",
                            color.value === "white"
                                ? "border-gray-300"
                                : "border-transparent"
                        )}
                        style={{ backgroundColor: color.hex }}
                    />
                    <span>Selected: {color.label}</span>
                </div>
            );
        }
        return null;
    };

    const handlecurrencychange = (value) => {
        setCurrency(value);
        setData("currency", value);
    };

    const handlestatuschange = (value) => {
        setData("status", value);
    };

    const handleRentalTypechange = (value) => {
        setData("rental_type", value);
    };

    const handleConditionchange = (value) => {
        setData("condition", value);
    };
    const handleColorChange = (colorValue) => {
        setSelectedColor(colorValue); // Update the selected color
        setData("color", colorValue); // Update form data
    };
    const handleBodyTypeChange = (value) => {
        setSelectedBodyType(value); // Update local state for body type
        setData("body_type", value); // Update form data
    };

    const handleMileageChange = (e) => {
        // Get the value from input field
        let value = e.target.value;

        // Remove all non-numeric characters (to prevent letters or other symbols)
        value = value.replace(/\D/g, "");

        // Format the number with commas
        if (value.length > 3) {
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        // Set the formatted value
        setData({
            ...data,
            mileage: value,
        });
    };
    const handlePriceChange = (e) => {
        let value = e.target.value;

        // Remove all non-numeric characters
        value = value.replace(/\D/g, "");

        // Format the number with dots as thousand separators
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        // Update state with the formatted value
        setData("price", value);
    };
    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: currentYear - 1970 + 1 },
        (_, i) => currentYear - i
    );
    return (
        <>
            <Head title={"Sell Your Car"} />
            <div className="bg-gray-100 xs-s-range:min-h-[334vh] xs-range:text-xs w-full xs-range:min-h-[270vh] min-h-screen">
                <div className="max-w-4xl mx-auto p-4 space-y-8 xs-range:p-2 xs-range:space-y-0 xs-range:max-w-[400px] xs-range:h-full overflow-y-auto overflow-x-hidden">
                    <div className="flex flex-col items-center justify-center space-y-2 mb-8 xs-range:mb-4">
                        <div className="flex justify-center mb-2 xs-range:mb-2">
                            <div className="logo-container">
                                <Link
                                    href="/"
                                    className="flex items-center gap-1"
                                >
                                    <div className="font-bold text-2xl text-gray-800">
                                        <span className="text-primary">X</span>
                                        <span>Motors</span>
                                        <span className="text-primary">.</span>
                                        <span>com</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-center">
                            Sell Your Car
                        </h1>
                    </div>

                    {/* Image Upload Section */}
                    <form
                        onSubmit={submit}
                        className="xs-range:text-xs xs-range:space-y-2"
                        name="form-to-create-car"
                    >
                        <div className="space-y-4">
                            <Label htmlFor="images">Car Images</Label>
                            <div
                                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-1">
                                    Drag and drop your images here or click to
                                    browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Upload multiple images of your car
                                </p>
                                <input
                                    ref={fileInputRef}
                                    id="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                {errors.images && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.images}
                                    </p>
                                )}
                            </div>

                            {/* Image Preview */}
                            {imageUrls.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                    {imageUrls.map((url, index) => (
                                        <div
                                            key={index}
                                            className="relative group"
                                        >
                                            <div className="aspect-square rounded-md overflow-hidden border">
                                                <LazyLoadImage
                                                    src={
                                                        url ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={`Car image ${
                                                        index + 1
                                                    }`}
                                                    width={200}
                                                    height={200}
                                                    className="object-cover h-full w-full"
                                                    effect="blur" // Optional effect for lazy loading
                                                />
                                            </div>
                                            <button
                                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
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
                            {/*Description */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your car, its condition, features, etc."
                                        className="min-h-[120px] xs-range:min-h-[60px]"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={handlestatuschange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sell">
                                            For Sell
                                        </SelectItem>
                                        <SelectItem value="rent">
                                            For Rent
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.status}
                                    </p>
                                )}
                            </div>

                            {data.status === "rent" && (
                                <div className="space-y-2">
                                    <Label htmlFor="RentType">Rent Type</Label>
                                    <Select
                                        value={data.rental_type}
                                        onValueChange={handleRentalTypechange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Rent Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">
                                                Daily
                                            </SelectItem>
                                            <SelectItem value="weekly">
                                                Weekly
                                            </SelectItem>
                                            <SelectItem value="monthly">
                                                Mounthly
                                            </SelectItem>
                                            <SelectItem value="yearly">
                                                Yearly
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.rental_type && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.rental_type}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <Select
                                    value={data.condition}
                                    onValueChange={handleConditionchange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="used">
                                            Used
                                        </SelectItem>
                                        <SelectItem value="new">New</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.condition && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.condition}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={data.currency}
                                    onValueChange={handlecurrencychange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">
                                            USD (US Dollar)
                                        </SelectItem>
                                        <SelectItem value="SYP">
                                            SYP (Syrian Pound)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.currency && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.currency}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="price"
                                    className="flex items-center gap-2"
                                >
                                    <DollarSign className="h-4 w-4" />
                                    Price ({data.currency})
                                </Label>
                                <Input
                                    id="price"
                                    type="text"
                                    placeholder={`Price in ${currency}`}
                                    value={data.price}
                                    onChange={handlePriceChange}
                                    oninput="this.value = this.value.replace(/\D/g, '')"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
                            {/* Brand and Model */}
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Select
                                    onValueChange={handleBrandChange}
                                    value={selectedBrand?.name}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand">
                                            {selectedBrand ? (
                                                <div className="flex items-center gap-4">
                                                    {selectedBrand.name !==
                                                        "Others" && (
                                                        <LazyLoadImage
                                                            src={
                                                                selectedBrand.image ||
                                                                "/placeholder.svg"
                                                            }
                                                            alt={`${selectedBrand.name} logo`}
                                                            className="object-contain w-[40px] h-[20px]"
                                                            effect="blur"
                                                        />
                                                    )}
                                                    <span>
                                                        {selectedBrand.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                "Select brand"
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {carData.data.map((brand) => (
                                            <SelectItem
                                                key={brand.id}
                                                value={brand.name}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {brand.name !==
                                                        "Others" && (
                                                        <LazyLoadImage
                                                            src={
                                                                brand.image ||
                                                                "/placeholder.svg"
                                                            }
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
                                {errors.brand && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.brand}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    placeholder="Enter car model"
                                    value={data.model}
                                    onChange={(e) =>
                                        setData("model", e.target.value)
                                    }
                                />
                                {errors.model && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.model}
                                    </p>
                                )}
                            </div>
                            {/* Year Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Select
                                    value={data.year}
                                    onValueChange={(value) =>
                                        setData("year", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem
                                                key={year}
                                                value={year.toString()}
                                            >
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.year && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.year}
                                    </p>
                                )}
                            </div>

                            {/* Location and Price */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="location"
                                    className="flex items-center gap-2"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    placeholder="City, Region"
                                    value={data.location}
                                    onChange={(e) =>
                                        setData("location", e.target.value)
                                    }
                                />
                                {errors.location && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.location}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="mileage"
                                    className="flex items-center gap-2"
                                >
                                    <Car className="h-4 w-4" />
                                    Mileage (km)
                                </Label>
                                <Input
                                    id="mileage"
                                    type="number"
                                    placeholder="Vehicle mileage in kilometers"
                                    value={data.mileage}
                                    onChange={handleMileageChange}
                                />
                                {errors.mileage && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.mileage}
                                    </p>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="phone"
                                    className="flex items-center gap-2"
                                >
                                    <Phone className="h-4 w-4" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    placeholder="Your contact number"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.phone}
                                </p>
                            )}
                            {/* Company Information */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border xs-range:rounded-sm">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="company-logo"
                                        className="flex items-center gap-2"
                                    >
                                        <Building2 className="h-4 w-4" />
                                        Company Logo
                                    </Label>
                                    <div
                                        className={cn(
                                            "w-24 h-24 mx-auto md:mx-0 rounded-full border-2 border-dashed flex items-center justify-center transition-colors overflow-hidden xs-range:w-14 xs-range:h-12",
                                            companyLogoUrl
                                                ? "border-0"
                                                : "border-muted-foreground/30",
                                            isCompanyDataAvailable &&
                                                "opacity-50 cursor-not-allowed"
                                        )}
                                        onDragOver={handleCompanyLogoDragOver}
                                        onDrop={handleCompanyLogoDrop}
                                        onClick={() => {
                                            if (!isCompanyDataAvailable) {
                                                companyLogoInputRef.current?.click();
                                            }
                                        }}
                                    >
                                        {companyLogoUrl ? (
                                            <div className="relative w-full h-full group">
                                                <img
                                                    src={
                                                        companyLogoUrl ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt="Company logo"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                                                    {!isCompanyDataAvailable && (
                                                        <button
                                                            className="hidden group-hover:flex bg-destructive text-destructive-foreground rounded-full p-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeCompanyLogo();
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
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
                                    <p className="text-xs text-center md:text-left text-muted-foreground">
                                        Click or drag to upload logo
                                    </p>
                                    {errors.company_logo && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.company_logo}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 flex flex-col justify-center">
                                    <Label
                                        htmlFor="company-name"
                                        className="flex items-center gap-2"
                                    >
                                        <Building2 className="h-4 w-4" />
                                        Company Name
                                    </Label>
                                    <Input
                                        id="company-name"
                                        placeholder="Your company name (if applicable)"
                                        value={data.company_name}
                                        onChange={(e) =>
                                            setData(
                                                "company_name",
                                                e.target.value
                                            )
                                        }
                                        disabled={isCompanyDataAvailable}
                                    />
                                    {errors.company_name && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.company_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 flex flex-col justify-center">
                                    <Label
                                        htmlFor="company-location"
                                        className="flex items-center gap-2"
                                    >
                                        <MapPin className="h-4 w-4" />
                                        Company Location
                                    </Label>
                                    <Input
                                        id="company-location"
                                        placeholder="Your company Location (if applicable)"
                                        value={data.company_location}
                                        onChange={(e) =>
                                            setData(
                                                "company_location",
                                                e.target.value
                                            )
                                        }
                                        disabled={isCompanyDataAvailable}
                                    />
                                    {errors.company_location && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.company_location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Body Type */}
                            <div className="md:col-span-2 space-y-3">
                                <Label>Body Type</Label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                    {bodyTypes.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected =
                                            selectedBodyType === type.value;
                                        return (
                                            <Card
                                                key={type.value}
                                                className={cn(
                                                    "cursor-pointer hover:bg-muted transition-colors relative",
                                                    isSelected
                                                        ? "ring-2 ring-primary bg-primary/5"
                                                        : ""
                                                )}
                                                onClick={() =>
                                                    handleBodyTypeChange(
                                                        type.value
                                                    )
                                                }
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                                                        <Check className="h-2 w-2 sm:h-3 sm:w-3" />
                                                    </div>
                                                )}
                                                <CardContent className="p-2 sm:p-3 text-center">
                                                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
                                                    <span className="text-xs sm:text-sm">
                                                        {type.label}
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                                {getSelectedBodyTypeLabel()}
                                {errors.body_type && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.body_type}
                                    </p>
                                )}
                            </div>

                            {/* Doors */}
                            <div className="space-y-2">
                                <Label htmlFor="doors">Doors</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setData("doors", value)
                                    }
                                    value={data.doors}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select number of doors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doorOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
                                                {option} doors
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.doors && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.doors}
                                    </p>
                                )}
                            </div>

                            {/* Cylinders */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="cylinders"
                                    className="flex items-center gap-2"
                                >
                                    <Wrench className="h-4 w-4" />
                                    Cylinders
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setData({
                                            ...data,
                                            cylinders: value,
                                            engine: "",
                                            fuel: "",
                                        })
                                    }
                                    value={data.cylinders}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select cylinders" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cylinderOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
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
                                {errors.cylinders && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.cylinders}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="engine"
                                    className="flex items-center gap-2"
                                >
                                    <Car className="h-4 w-4" />
                                    Engine (cc)
                                </Label>
                                <Input
                                    id="engine"
                                    type="number"
                                    placeholder="Vehicle Engine in cc"
                                    value={data.engine}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            engine: e.target.value,
                                        })
                                    }
                                    disabled={isElectric} // Disable if Electric
                                    className={
                                        isElectric
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }
                                />
                                {errors.engine && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.engine}
                                    </p>
                                )}
                            </div>
                            {/* Transmission */}
                            <div className="space-y-2">
                                <Label htmlFor="transmission">
                                    Transmission
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setData("transmission", value)
                                    }
                                    value={data.transmission}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select transmission type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transmissionOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option.toLowerCase()}
                                            >
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.transmission && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.transmission}
                                    </p>
                                )}
                            </div>

                            {/* Fuel Type */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="fuel"
                                    className="flex items-center gap-2"
                                >
                                    <Fuel className="h-4 w-4" />
                                    Fuel Type
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setData({ ...data, fuel: value })
                                    }
                                    disabled={isElectric}
                                    value={data.fuel} // Disable if Electric
                                >
                                    <SelectTrigger
                                        className={
                                            isElectric
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }
                                    >
                                        <SelectValue placeholder="Select fuel type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fuelOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option.toLowerCase()}
                                            >
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.fuel && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.fuel}
                                    </p>
                                )}
                            </div>

                            {/* Color */}
                            <div className="md:col-span-2 space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Color
                                </Label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                                    {colorOptions.map((color) => {
                                        const isSelected =
                                            selectedColor === color.value;
                                        return (
                                            <div
                                                key={color.value}
                                                className="flex flex-col items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() =>
                                                    handleColorChange(
                                                        color.value
                                                    )
                                                }
                                            >
                                                <div
                                                    className={cn(
                                                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full border relative",
                                                        color.value === "white"
                                                            ? "border-gray-300"
                                                            : "border-transparent",
                                                        isSelected
                                                            ? "ring-2 ring-primary ring-offset-2"
                                                            : ""
                                                    )}
                                                    style={{
                                                        backgroundColor:
                                                            color.hex,
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Check
                                                                className={cn(
                                                                    "h-4 w-4 sm:h-5 sm:w-5",
                                                                    [
                                                                        "white",
                                                                        "yellow",
                                                                        "beige",
                                                                    ].includes(
                                                                        color.value
                                                                    )
                                                                        ? "text-black"
                                                                        : "text-white"
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] sm:text-xs">
                                                    {color.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {getSelectedColorDisplay()}
                                {errors.color && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.color}
                                    </p>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="md:col-span-2 space-y-4">
                                <Label
                                    htmlFor="tags"
                                    className="flex items-center gap-2"
                                >
                                    <Tag className="h-4 w-4" />
                                    Tags
                                </Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {data.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            {tag}
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                onClick={() => removeTag(tag)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        id="tags"
                                        value={tagInput}
                                        onChange={(e) =>
                                            setTagInput(e.target.value)
                                        }
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="Add tags (e.g., leather seats, sunroof)"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleTagAdd}
                                        variant="outline"
                                    >
                                        Add
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Press Enter to add a tag
                                </p>
                                {errors.tags && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.tags}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Submit Button */}
                        <Button
                            className="w-full md:w-auto mt-5 xs-range:mt-2 text-white hover:bg-primary-hover"
                            size="lg"
                            type="submit"
                            disabled={processing}
                        >
                            Submit Listing
                        </Button>
                    </form>
                </div>
                <Dialog
                    open={loginDialogOpen}
                    onOpenChange={setLoginDialogOpen}
                >
                    <DialogContent className="sm:max-w-md">
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="rounded-full bg-rose-100 p-3 mb-4">
                                <LogIn className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">
                                Login Required
                            </h2>
                            <p className="text-center text-gray-500 mb-6">
                                You need to login to Rate cars.
                            </p>
                            <p className="text-center text-gray-500 mb-6">
                                Pleace Click on Menu Button
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>

                <AlertDialog
                    open={showErrorDialog}
                    onOpenChange={setShowErrorDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Form Error</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please fix the following errors before
                                submitting:
                                <ul className="mt-2 list-disc list-inside text-red-600 space-y-1">
                                    {Object.entries(errors).map(
                                        ([field, message]) => (
                                            <li key={field}>{message}</li>
                                        )
                                    )}
                                </ul>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction
                                onClick={() => setShowErrorDialog(false)}
                                className="text-white"
                            >
                                Okay
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}
