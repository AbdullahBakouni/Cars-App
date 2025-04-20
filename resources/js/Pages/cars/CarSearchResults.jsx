import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect, Suspense, lazy, useRef } from "react";
import { ArrowDownWideNarrow, ChevronUp, Eye, LogIn, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Inertia } from "@inertiajs/inertia";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import axios from "axios";
const NavBar = lazy(() => import("@/Components/NavBar"));
const RatingStars = lazy(() => import("@/Components/RatingStars"));
const CarSearchResults = ({
    auth,
    cars,
    totalResults,
    hasVerifiedEmail,
    filters,
}) => {
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [sortDialogOpen, setSortDialogOpen] = useState(false);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    // Get body_type from URL
    const queryParams = new URLSearchParams(window.location.search);
    const sortoption = queryParams.get("sort");
    const [pendingSortOption, setPendingSortOption] = useState(
        sortoption || "posted"
    );
    const { currency } = usePage().props;
    const prevCurrency = useRef(currency);
    const { resetpassstatus } = usePage().props;
    const currentPage = cars.current_page;
    const totalPages = cars.last_page;

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
        // لو تغيّرت العملة فعلاً
        if (prevCurrency.current !== currency) {
            prevCurrency.current = currency; // حدّث العملة القديمة
            Inertia.visit(
                route("cars.byBodyType", {
                    body_type: queryParams.get("body_type"),
                    brand_name: queryParams.get("brand_name"),
                    model_name: queryParams.get("model_name"),
                    maxPrice: queryParams.get("maxPrice"),
                    category: queryParams.get("category"),
                    currency: currency,
                    sort: pendingSortOption,
                    page: currentPage,
                }),
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }
    }, [currency]);
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const applySorting = () => {
        setSortDialogOpen(false);
        // Reset page to 1 when sorting is changed
        Inertia.visit(
            route("cars.byBodyType", {
                body_type: queryParams.get("body_type"),
                brand_name: queryParams.get("brand_name"),
                model_name: queryParams.get("model_name"),
                maxPrice: queryParams.get("maxPrice"),
                category: queryParams.get("category"),
                currency: currency,
                sort: pendingSortOption,
                page: currentPage,
                filters: filters, // Reset to page 1
            }),
            { preserveState: true }
        );
    };

    const getSortLabel = (value) => {
        const options = {
            posted: "Posted (Newest First)",
            "price-low": "Price: Low to High",
            "price-high": "Price: High to Low",
            "year-new": "Year: Newest First",
            "year-old": "Year: Oldest First",
            "mileage-low": "Mileage: Low to High",
            "mileage-high": "Mileage: High to Low",
        };
        return options[value] || "Sort";
    };
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };
    const handleSellCarClick = () => {
        if (auth?.user && hasVerifiedEmail) {
            Inertia.visit(route("createcar"));
        } else {
            setLoginDialogOpen(true);
        }
    };

    const renderPaginationItems = () => {
        const items = [];

        // Always show first page
        items.push(
            <PaginationItem key="first">
                <PaginationLink
                    onClick={() => handlePageChange(1)}
                    isActive={currentPage === 1}
                    className="cursor-pointer"
                >
                    1
                </PaginationLink>
            </PaginationItem>
        );

        // Show ellipsis if needed
        if (currentPage > 3) {
            items.push(
                <PaginationItem key="ellipsis-1">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Show current page and surrounding pages
        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            // Skip first and last (already shown)
            if (i === 1 || i === totalPages) continue;

            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => handlePageChange(i)}
                        isActive={currentPage === i}
                        className="cursor-pointer"
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Show ellipsis if needed
        if (currentPage < totalPages - 2) {
            items.push(
                <PaginationItem key="ellipsis-2">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Always show last page if more than 1 page
        if (totalPages > 1) {
            items.push(
                <PaginationItem key="last">
                    <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                        isActive={currentPage === totalPages}
                        className="cursor-pointer"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    const handlePageChange = (page) => {
        Inertia.get(route("cars.byBodyType"), {
            page,
            sort: pendingSortOption,
            currency: currency, // Ensure the sort option is passed
            preserveState: true,
            preserveScroll: true,
        });
    };
    return (
        <>
            <Head
                title={
                    cars.data.length > 0
                        ? `Page ${cars.current_page} - ${cars.data.length} Cars`
                        : "No Cars"
                }
            />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <Suspense fallback={<div>Loading...</div>}>
                    <NavBar
                        auth={auth ? auth : ""} // Ensure it's a string, or provide a default value
                        hasVerifiedEmail={hasVerifiedEmail || false} // Ensure it's a boolean
                        currency={currency || "SYP"} // Ensure it's a string
                        resetpassstatus={resetpassstatus || ""}
                        filters={filters || null} // Ensure it's a string
                    />
                </Suspense>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-6">
                    {cars.data.length === 0 ? (
                        // Display message if no cars are available
                        <div className="flex justify-center items-center h-64 text-lg text-gray-500">
                            <p>There are no cars yet</p>
                        </div>
                    ) : (
                        // Display the list of cars if available
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {cars.data.map((car) => (
                                <Card
                                    key={car.id}
                                    className="overflow-hidden hover:shadow-lg transition-shadow h-full"
                                >
                                    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden rounded-md">
                                        {/* Image as background layer */}
                                        {car.images &&
                                            car.images.length > 0 && (
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
                                                {car.year} {car.brand}{" "}
                                                {car.model}
                                            </h3>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 mb-2 ">
                                            <div className="flex items-center gab-1 justify-center">
                                                <span className="font-bold text-xs xs-s-range:text-[8px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">
                                                    {formatPrice(car.mileage)}{" "}
                                                    km
                                                </span>
                                                <span className="mx-1 xs-s-range:text-[9px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">
                                                    •
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold xs-s-range:text-[8px] xs-s-range:leading-[8px] xs-range:text-[10px] xs-range:leading-[10px]">
                                                {car.description &&
                                                car.description.split(" ")
                                                    .length > 4
                                                    ? `${car.description
                                                          .split(" ")
                                                          .slice(0, 4)
                                                          .join(" ")}...`
                                                    : car.description}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2 xs-s-range:text-[9px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">
                                            <div>
                                                {car.tags &&
                                                car.tags.length > 0 ? (
                                                    <div className="flex gap-1 justify-center">
                                                        {car.tags
                                                            .slice(0, 2)
                                                            .map((tag) => (
                                                                <span
                                                                    key={tag.id}
                                                                    className="bg-gray-200 px-2 py-1 rounded-full text-gray-600 text-[10px] leading-[9px]"
                                                                >
                                                                    {tag.name
                                                                        .split(
                                                                            " "
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            2
                                                                        )
                                                                        .join(
                                                                            " "
                                                                        )}
                                                                </span>
                                                            ))}
                                                        {car.tags.length >
                                                            2 && (
                                                            <span className="text-[9px] leading-[8px] text-gray-500">
                                                                +
                                                                {car.tags
                                                                    .length -
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
                                                <Suspense
                                                    fallback={
                                                        <div>
                                                            Loading rating...
                                                        </div>
                                                    }
                                                >
                                                    <RatingStars
                                                        rating={car.rates || ""}
                                                        size="sm"
                                                        interactive={false}
                                                    />
                                                </Suspense>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Sticky Footer */}
                    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t shadow-md h-[42px]">
                        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                            <Button
                                variant="outline"
                                className="flex items-center gap-1 bg-primary-hover hover:bg-primary-hover text-white hover:text-white xs-range:p-0
          -mt-3"
                                onClick={() => setSortDialogOpen(true)}
                            >
                                <ArrowDownWideNarrow className="h-4 w-4 xs-range:w-1 xs-range:h-1" />
                                <span className="xs-range:text-[9px] xs-range:leading-[9px] mr-1">
                                    {sortoption
                                        ? getSortLabel(sortoption)
                                        : "Posted"}
                                </span>
                            </Button>
                            <div>
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center">
                                        <Pagination className="xs-range:text-xs xs-s-range:text-[8px] xs-s-range:leading-[8px]">
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() =>
                                                            handlePageChange(
                                                                Math.max(
                                                                    1,
                                                                    currentPage -
                                                                        1
                                                                )
                                                            )
                                                        }
                                                        className={`${
                                                            currentPage === 1
                                                                ? "pointer-events-none opacity-50"
                                                                : "cursor-pointer"
                                                        } xs-range:hidden xs-s-range:hidden`}
                                                    />
                                                </PaginationItem>

                                                {renderPaginationItems()}

                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() =>
                                                            handlePageChange(
                                                                Math.min(
                                                                    totalPages,
                                                                    currentPage +
                                                                        1
                                                                )
                                                            )
                                                        }
                                                        className={`${
                                                            currentPage ===
                                                            totalPages
                                                                ? "pointer-events-none opacity-50"
                                                                : "cursor-pointer"
                                                        } xs-range:hidden xs-s-range:hidden`}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 justify-between">
                                {showScrollButton && (
                                    <Button
                                        onClick={scrollToTop}
                                        className="rounded-full w-8 h-8 bg-primary hover:bg-primary-hover flex items-center justify-center 
                xs-range:text-[9px] xs-range:leading-[9px] xs-range:p-0 xs-s-range:p-0"
                                        aria-label="Scroll to top"
                                    >
                                        <ChevronUp className="h-4 w-4 xs-range:h-1 xs-range:w-1" />
                                    </Button>
                                )}
                                <div className="text-sm text-gray-500 xs-s-range:text-[8px] xs-s-range:leading-[8px] xs-range:text-[9px] xs-range:leading-[9px]">
                                    {cars.data.length}/{totalResults} vehicles
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sort Dialog */}
                    <Dialog
                        open={sortDialogOpen}
                        onOpenChange={setSortDialogOpen}
                    >
                        <DialogContent className="sm:max-w-md xs-range:max-w-xs">
                            <DialogHeader>
                                <DialogTitle className="text-center text-xl">
                                    Sort By
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <RadioGroup
                                    value={pendingSortOption}
                                    onValueChange={setPendingSortOption}
                                    className="space-y-4"
                                >
                                    {/* Default Sorting */}
                                    <div className="flex items-center space-x-2 border-b pb-4">
                                        <RadioGroupItem
                                            value="posted"
                                            id="posted"
                                        />
                                        <Label
                                            htmlFor="posted"
                                            className="font-medium"
                                        >
                                            Posted (Newest First)
                                        </Label>
                                    </div>

                                    {/* Price Sorting */}
                                    <div className="space-y-4 border-b pb-4">
                                        <h3 className="font-semibold">Price</h3>
                                        <div className="flex items-center space-x-2 pl-4">
                                            <RadioGroupItem
                                                value="price-low"
                                                id="price-low"
                                            />
                                            <Label htmlFor="price-low">
                                                Low to High
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 pl-4">
                                            <RadioGroupItem
                                                value="price-high"
                                                id="price-high"
                                            />
                                            <Label htmlFor="price-high">
                                                High to Low
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Year Sorting */}
                                    <div className="space-y-4 border-b pb-4">
                                        <h3 className="font-semibold">Year</h3>
                                        <div className="flex items-center space-x-2 pl-4">
                                            <RadioGroupItem
                                                value="year-new"
                                                id="year-new"
                                            />
                                            <Label htmlFor="year-new">
                                                Newest First
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 pl-4">
                                            <RadioGroupItem
                                                value="year-old"
                                                id="year-old"
                                            />
                                            <Label htmlFor="year-old">
                                                Oldest First
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Mileage Sorting */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">
                                            Mileage
                                        </h3>
                                        <div className="flex items-center space-x-2 pl-4">
                                            <RadioGroupItem
                                                value="mileage-low"
                                                id="mileage-low"
                                            />
                                            <Label htmlFor="mileage-low">
                                                Low to High
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 pl-4">
                                            <RadioGroupItem
                                                value="mileage-high"
                                                id="mileage-high"
                                            />
                                            <Label htmlFor="mileage-high">
                                                High to Low
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="flex justify-center">
                                <Button
                                    className="w-full bg-primary hover:bg-primary-hover text-white"
                                    onClick={applySorting}
                                >
                                    Apply
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

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
                                    You need to login to sell your car on
                                    SyartiSy.
                                </p>
                                <p className="text-center text-gray-500 mb-6">
                                    Pleace Click on Menu Button
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </main>

                {/* Sell button */}
                {showScrollButton && (
                    <Button
                        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 rounded-full px-8 py-6 bg-primary hover:bg-primary-hover text-white shadow-lg flex items-center justify-center z-50 md:left-auto md:right-6 md:bottom-24"
                        aria-label="Sell"
                        onClick={handleSellCarClick}
                    >
                        Sell
                    </Button>
                )}
            </div>
        </>
    );
};

export default CarSearchResults;
