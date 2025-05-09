import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Truck, Bus, Package, LogIn, Eye } from "lucide-react";
import carData from "./cars";
import NavBar from "@/Components/NavBar";
import { Inertia } from "@inertiajs/inertia";
import { Link, router, usePage } from "@inertiajs/react";
import { Dialog, DialogContent, DialogTitle } from "@/Components/ui/dialog";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import axios from "axios";
import { Card, CardContent } from "@/Components/ui/card";
import RatingStars from "@/Components/RatingStars";
import ContactBanner from "@/Components/ContactBanner";
import Footer from "@/Components/Footer";
export default function Welcome({
    auth,
    hasVerifiedEmail,
    message,
    message_type,
}) {
    const [maxPrice, setMaxPrice] = useState("");
    const [expandMakes, setExpandMakes] = useState(false);
    const { currency } = usePage().props;
    const { resetpassstatus } = usePage().props;
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [cars, setCars] = useState([]);
    const bodyTypes = [
        { id: "coupe", label: "COUPE", icon: <Car className="w-6 h-6" /> },
        { id: "sedan", label: "SEDAN", icon: <Car className="w-6 h-6" /> },
        { id: "suv", label: "SUV", icon: <Car className="w-6 h-6" /> },
        { id: "hatch", label: "HATCH", icon: <Car className="w-6 h-6" /> },
        { id: "wagon", label: "WAGON", icon: <Car className="w-6 h-6" /> },
        { id: "pickup", label: "PICKUP", icon: <Truck className="w-6 h-6" /> },
        { id: "minivan", label: "MINIVAN", icon: <Bus className="w-6 h-6" /> },
        {
            id: "commercial",
            label: "COMMERCIAL",
            icon: <Truck className="w-6 h-6" />,
        },
        { id: "other", label: "OTHER", icon: <Package className="w-6 h-6" /> },
    ];

    const carCategories = [
        {
            id: 1,
            name: "Economy",
            description: "affordable aconomy cars.",
            image: "/images/economy.jpg",
        },
        {
            id: 2,
            name: "Family",
            description: "affordable family cars.",
            image: "/images/family.jpg",
        },
        {
            id: 3,
            name: "Elecrtic",
            description: "affordable electric cars.",
            image: "/images/electric.jpg",
        },
        {
            id: 4,
            name: "Luxury",
            description: "affordable luxury cars.",
            image: "/images/luxuary.jpg",
        },
        {
            id: 5,
            name: "Sport",
            description: "affordable sport cars.",
            image: "/images/sport.jpg",
        },
        {
            id: 6,
            name: "SuperCars",
            description: "high-end sport cars.",
            image: "/images/supercar.jpg",
        },
        {
            id: 7,
            name: "Adventure",
            description: "affordable adventure cars.",
            image: "/images/adventure.jpg",
        },
        {
            id: 8,
            name: "Utility",
            description: "affordable utility cars.",
            image: "/images/utility.jpg",
        },
    ];
    const handleCardClick = (carId) => {
        axios
            .post("/cars/session", { car_id: carId })
            .then((response) => {
                const redirectUrl = response.data.redirect;
                router.visit(redirectUrl);
            })
            .catch((error) => {
                console.error("Failed to set car session:", error);
            });
    };
    useEffect(() => {
        if (message && message_type) {
            setLoginDialogOpen(true);
        }
    }, [message, message_type]);

    const formatPrice = (price) => {
        const format = (num, suffix) => {
            const formatted = num.toFixed(1);
            return (
                (formatted.endsWith(".0") ? parseInt(formatted) : formatted) +
                suffix
            );
        };

        if (price >= 1_000_000_000) return format(price / 1_000_000_000, "B");
        if (price >= 1_000_000) return format(price / 1_000_000, "M");
        if (price >= 1_000) return format(price / 1_000, "K");
        return price.toString();
    };
    useEffect(() => {
        async function fetchRecentCars() {
            try {
                const response = await axios.get(route("recent_cars"));
                setCars(response.data.data);
            } catch (err) {
                console.error("Error fetching recent cars:", err);
            }
        }

        fetchRecentCars();
    }, []);
    const handleBodyTypeClick = (typeId) => {
        Inertia.visit(route("cars.byBodyType"), {
            method: "get",
            data: {
                body_type: typeId,
                currency: currency === null ? "SYP" : currency,
            },
            preserveState: true, // الاحتفاظ بحالة الصفحة
        });
    };

    const handleBrandNameClick = (brandName) => {
        Inertia.visit(route("cars.byBodyType"), {
            method: "get",
            data: {
                brand_name: brandName,
                currency: currency === null ? "SYP" : currency,
            },
            preserveState: true, // الاحتفاظ بحالة الصفحة
        });
    };
    const handleSearch = () => {
        if (!maxPrice) return; // لا ترسل الطلب إذا لم يدخل المستخدم سعراً
        Inertia.visit(route("cars.byBodyType"), {
            method: "get",
            data: { maxPrice, currency: currency === null ? "SYP" : currency },
            preserveState: true, // الاحتفاظ بحالة الصفحة
        });
    };

    const handleCategoryClick = (categoryName) => {
        Inertia.visit(route("cars.byBodyType"), {
            method: "get",
            data: {
                category: categoryName,
                currency: currency === null ? "SYP" : currency,
            },
            preserveState: true, // الاحتفاظ بحالة الصفحة
        });
    };
    return (
        <>
            <div className="flex flex-col min-h-screen bg-white">
                {/* Header */}
                <NavBar
                    auth={auth}
                    hasVerifiedEmail={hasVerifiedEmail}
                    currency={currency}
                    resetpassstatus={resetpassstatus}
                    
                />

                {/* Main Content */}
                <main className="md:flex-1 relative overflow-hidden">
                    {/* Background Dots */}
                    <div className="absolute left-0 bottom-0 opacity-20">
                        <div className="grid grid-cols-6 gap-2">
                            {Array(24)
                                .fill(0)
                                .map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1 h-1 rounded-full bg-primary"
                                    ></div>
                                ))}
                        </div>
                    </div>

                    {/* Car Image and Overlay */}
                    <div className="relative w-full md:h-[400px] flex items-center justify-center bg-gray-200 md:-mt-12 xs-range:bg-gray-50">
                        <div className="relative w-[400px] h-[300px] flex items-center justify-center xs-s-range:w-[200px] xs-s-range:h-[200px] xs-range:w-[200px] xs-range:h-[200px]">
                            {/* Left Text */}
                            <div className="absolute left-[-130px] top-[62%] -translate-y-1/2 flex items-center space-x-1 text-2xl md:text-4xl font-bold text-gray-800 xs-s-range:left-[-65px] xs-s-range:top-[60%]  xs-range:left-[-80px] xs-range:top-[60%]">
                                <span className="flex items-center text-gray-800 font-bold text-2xl md:text-2xl xs-s-range:text-xs xs-range:text-sm">
                                    <span className="text-primary">X</span>
                                    <span>Motors</span>
                                    <span className="text-primary">.</span>
                                    <span>co</span>
                                    <span className="relative inline-block -ml-0 animate-squish">
                                        m
                                    </span>
                                </span>
                            </div>

                            {/* Right Text */}
                            <div className="absolute right-[-75px] top-[60%] -translate-y-1/2 flex items-center text-2xl md:text-2xl font-bold text-primary xs-s-range:text-xs xs-s-range:right-[-30px] xs-range:text-sm xs-range:right-[-40px]">
                                <span className="mx-2">||</span>
                                <span className="text-gray-800">Syria</span>
                            </div>

                            {/* Car Image */}
                            <LazyLoadImage
                                src="images/911.png"
                                alt="Luxury Car"
                                className="object-contain w-full h-full"
                                effect="blur"
                            />
                        </div>
                    </div>

                    {/* Search Box */}
                    <div
                        className="absolute bottom-[165px] left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-2 xs-range:relative sm-range:relative
        sm-range:bottom-2 xs-range:bottom-1"
                    >
                        <div
                            className="bg-white rounded-lg shadow-xl p-4 xs-range:p-2 xs-range:rounded-sm 
          sm-range:p-3 sm-range:max-w-2xl xs-range:max-w-xl"
                        >
                            <div className="flex flex-row items-center gap-4">
                                <div className="flex-1">
                                    {currency === "SYP" || currency === null ? (
                                        <label
                                            htmlFor="maxPrice"
                                            className="block text-sm font-medium text-gray-600 mb-1 xs-range:text-xs"
                                        >
                                            Maximum price in SYP
                                        </label>
                                    ) : (
                                        <label
                                            htmlFor="maxPrice"
                                            className="block text-sm font-medium text-gray-600 mb-1 xs-range:text-xs"
                                        >
                                            Maximum price in USD
                                        </label>
                                    )}
                                    <Input
                                        id="maxPrice"
                                        type="number"
                                        min="0"
                                        className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                                        value={maxPrice}
                                        onChange={(e) =>
                                            setMaxPrice(e.target.value)
                                        }
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    className="bg-primary hover:bg-primary-hover text-white px-8 h-10 mt-4 md:mt-6 xs-range:px-4"
                                >
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
                                    <div
                                        key={i}
                                        className="w-1 h-1 rounded-full bg-primary"
                                    ></div>
                                ))}
                        </div>
                    </div>
                    <div className="pt-6 border-t">
                        <div className="flex items-center mb-2">
                            <h2 className="text-sm font-bold text-gray-700 ml-1">
                                BODY TYPE
                            </h2>
                            <div className="ml-2 h-px bg-gray-300 flex-grow"></div>
                        </div>

                        {/* Body Type Section */}
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                            {bodyTypes.map((type) => (
                                <div
                                    key={type.id}
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                    onClick={() => handleBodyTypeClick(type.id)}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center mb-1 text-primary">
                                        {type.icon}
                                    </div>
                                    <span className="text-[10px] text-center">
                                        {type.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-5">
                        <div className="mb-2 text-center">
                            <h2 className="text-2xl font-bold text-gray-800 italic">
                                FEATURED CARS
                            </h2>
                            <p className="text-xs text-gray-600">
                                Current Deals
                            </p>
                        </div>
                    </div>
                </main>

                <div>
                    <div className="pt-4">
                        <div className="flex items-center mb-2">
                            <h2 className="text-sm font-bold text-gray-700 italic mr-2 ml-1">
                                MAKE
                            </h2>
                            <button
                                className="text-xs text-primary hover:text-primary-hover font-semibold"
                                onClick={() => setExpandMakes(!expandMakes)}
                            >
                                {expandMakes ? "Collapse" : "Expand"}
                            </button>
                            <div className="ml-2 h-px bg-gray-300 flex-grow"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                            {carData.data
                                .slice(
                                    0,
                                    expandMakes ? carData.data.length : 10
                                )
                                .map((brand) => (
                                    <div
                                        key={brand.id}
                                        className="flex flex-col items-center justify-center cursor-pointer"
                                        onClick={() =>
                                            handleBrandNameClick(brand.name)
                                        }
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center mb-2">
                                            <LazyLoadImage
                                                src={
                                                    brand.image ||
                                                    "/placeholder.svg"
                                                }
                                                alt={brand.name}
                                                className="object-contain w-[60px] h-[60px]"
                                                effect="blur"
                                            />
                                        </div>
                                        <span className="text-[12px] text-center">
                                            {brand.name}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto p-4">
                    {/* Car Categories Section */}
                    <div className="pt-6">
                        <div className="flex items-center mb-2">
                            <h2 className="text-sm font-bold text-gray-700 italic mr-2 ml-1">
                                CATEGORIES
                            </h2>
                            <div className="ml-2 h-px bg-gray-300 flex-grow"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sx:grid-cols-2">
                            {carCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="overflow-hidden cursor-pointer bg-gray-50 rounded-md hover:shadow-lg"
                                    onClick={() =>
                                        handleCategoryClick(category.name)
                                    }
                                >
                                    <div className="relative">
                                        <div className="aspect-square w-full">
                                            <LazyLoadImage
                                                src={
                                                    category.image ||
                                                    "/placeholder.svg"
                                                }
                                                alt={category.name}
                                                className="object-cover w-full h-full aspect-square"
                                                effect="blur"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-3 text-center">
                                        <h3 className="font-semibold text-gray-800">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-5">
                    <div className="mb-2 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 italic">
                            Latest Cars
                        </h2>
                        <Link
                            className="text-primary-hover font-semibold text-xs"
                            href="/cars/search"
                        >
                            View All
                        </Link>
                        <p className="text-lg text-gray-600">
                            Most Recently Posted
                        </p>
                    </div>
                </div>
                <div className="container mx-auto p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {cars.map((car) => (
                            <Card
                                key={car.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow h-full"
                            >
                                <div className="relative w-full aspect-square bg-gray-100 overflow-hidden rounded-md">
                                    {/* Image as background layer */}
                                    {car.images && car.images.length > 0 && (
                                        <LazyLoadImage
                                            src={`/storage/${car.images[0].image_path}`}
                                            alt={`${car.year} ${car.brand} ${car.model}`}
                                            className="w-full h-full object-cover aspect-square"
                                            effect="blur"
                                        />
                                    )}

                                    {/* Button on top */}
                                    <div className="absolute top-2 right-2 z-10">
                                        <button
                                            className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center xs-range:w-5 xs-range:h-5"
                                            onClick={() =>
                                                handleCardClick(car.id)
                                            }
                                        >
                                            <Eye className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-lg xs-range:text-sm xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                                            {car.year} {car.brand} {car.model}
                                        </h3>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mb-2 ">
                                        <div className="flex items-center gab-1 justify-center">
                                            <span className="font-bold text-xs xs-s-range:text-[8px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">
                                                {formatPrice(car.mileage)} km
                                            </span>
                                            <span className="mx-1 xs-s-range:text-[9px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">
                                                •
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold xs-s-range:text-[8px] xs-s-range:leading-[8px] xs-range:text-[10px] xs-range:leading-[10px]">
                                            {car.description &&
                                            car.description.split(" ").length >
                                                4
                                                ? `${car.description
                                                      .split(" ")
                                                      .slice(0, 4)
                                                      .join(" ")}...`
                                                : car.description}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2 xs-s-range:text-[9px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">
                                        <div>
                                            {car.tags && car.tags.length > 0 ? (
                                                <div
                                                    className="flex gap-1 justify-center"
                                                    key={car.tags.id}
                                                >
                                                    {car.tags
                                                        .slice(0, 2)
                                                        .map((tag) => (
                                                            <span
                                                                key={tag.id}
                                                                className="bg-gray-200 px-2 py-1 rounded-full text-gray-600 text-[10px] leading-[9px]"
                                                            >
                                                                {tag.name
                                                                    .split(" ")
                                                                    .slice(0, 2)
                                                                    .join(" ")}
                                                            </span>
                                                        ))}
                                                    {car.tags.length > 2 && (
                                                        <span className="text-[9px] leading-[8px] text-gray-500">
                                                            +
                                                            {car.tags.length -
                                                                2}{" "}
                                                            more
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="bg-gray-200 px-2 py-1 rounded-full text-gray-500 text-[10px] leading-[9px]">
                                                    {car.condition}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="bg-gray-200 px-2 py-1 rounded-full text-gray-500 text-[10px] leading-[9px]">
                                                For {car.status}
                                                {car.rental_type
                                                    ? ` · ${car.rental_type}`
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-primary-hover font-medium xs-range:text-xs xs-s-range:text-[8px] xs-s-range:leading-[8px]">
                                            {formatPrice(car.price)}{" "}
                                            {car.currency}
                                        </span>
                                        <div className="flex xs-range:text-xs">
                                            <RatingStars
                                                rating={car.rates || ""}
                                                size="sm"
                                                interactive={false}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="container mx-auto pt-4 px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <ContactBanner />
                    </div>
                </div>

                <Footer/>
                {message && message_type && (
                    <Dialog
                        open={loginDialogOpen}
                        onOpenChange={setLoginDialogOpen}
                    >
                        <DialogTitle>{message_type}</DialogTitle>
                        <DialogContent className="sm:max-w-md">
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="rounded-full bg-rose-100 p-3 mb-4">
                                    <LogIn className="h-6 w-6 text-blue-500" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">
                                    {message}
                                </h2>
                                <p className="text-center text-gray-500 mb-6">
                                    Please click on the menu button
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}
