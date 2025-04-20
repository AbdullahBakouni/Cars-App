import { CarCard } from "@/Components/CarCard";
import { Button } from "@/Components/ui/button";
import { Inertia } from "@inertiajs/inertia";
import { Head, router, usePage } from "@inertiajs/react";
import { Plus, Filter, CheckCircle2, Check, ChevronDown } from "lucide-react";
import { useEffect, useState, lazy, Suspense } from "react";
const NavBar = lazy(() => import("@/Components/NavBar"));
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "react-lazy-load-image-component/src/effects/blur.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ScrollArea } from "@/Components/ui/scroll-area";
const UserCars = ({ auth, cars, hasVerifiedEmail, selectedCompanyId }) => {
    const { currency } = usePage().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [message, setMessage] = useState("");
    const { success, resetpassstatus } = usePage().props;
    const [sortOption, setSortOption] = useState("default");
    const [visibleCars, setVisibleCars] = useState(cars.data);
    const [NewUserCompanies, setNewUserCompanies] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [currentpage, setCurrentPage] = useState(1);
    const totalPages = cars.last_page;
    const totalCars = cars.total;
    const [currentPageState, setCurrentPageState] = useState(
        cars?.current_page ?? 1
    );
    const [selectedMake, setSelectedMake] = useState(null);
    // تحديث currentPageState عند تغيّر بيانات السيارات
    useEffect(() => {
        if (cars?.current_page) {
            setCurrentPageState(cars.current_page);
        }
    }, [cars]);

    const companies = [
        ...new Map(
            cars.data.map((car) => [car.company.id, car.company])
        ).values(),
    ];

    // 🔁 لما تتغير قيمة selectedCompanyId من السيرفر، حدث الـ selectedMake
    useEffect(() => {
        if (selectedCompanyId && companies?.length) {
            const selected = companies.find((c) => c.id === selectedCompanyId);
            setSelectedMake(selected || null);
        } else {
            setSelectedMake(null);
        }
    }, [selectedCompanyId, companies]);

    const handleCompanyFilter = (companyId) => {
        const data = {};

        // إذا تم اختيار شركة نضيف الـ company_id
        if (companyId !== null && companyId !== "") {
            data.company_id = companyId;
        }

        router.visit(route("cars.my"), {
            method: "post",
            preserveState: true,
            preserveScroll: true,
            data,
        });
    };

    useEffect(() => {
        const storedMessage = sessionStorage.getItem("successMessage");
        if (storedMessage) {
            setMessage(storedMessage);
            setIsDialogOpen(true);
        } else if (success) {
            sessionStorage.setItem("successMessage", success);
            setMessage(success);
            setIsDialogOpen(true);
        }
    }, [success]);

    const handleStatusChange = (id, newStatus) => {
        const data = {
            car_id: id,
            status: newStatus,
            page: currentPageState,
        };

        if (selectedCompanyId) {
            data.company_id = selectedCompanyId;
        }

        router.post(route("cars.updateStatus"), data, {
            preserveScroll: true,
        });
    };

    const handleSellCarClick = () => {
        if (auth?.user && hasVerifiedEmail) {
            Inertia.visit(route("createcar"));
        } else {
            alert("Sorry You need to login");
        }
    };

    const handleSortChange = (option) => {
        setSortOption(option);

        const sortedCars = [...cars.data]; // انسخ السيارات الحالية

        switch (option) {
            case "price-low-to-high":
                sortedCars.sort((a, b) => a.price - b.price);
                break;
            case "price-high-to-low":
                sortedCars.sort((a, b) => b.price - a.price);
                break;
            case "rating-high-to-low":
                sortedCars.sort((a, b) => b.rates - a.rates);
                break;
            case "rating-low-to-high":
                sortedCars.sort((a, b) => a.rates - b.rates);
                break;
            default:
                break; // ما نعمل شي لو الخيار "default"
        }

        setVisibleCars(sortedCars); // حدث النتائج المعروضة
    };

    // 🔁 لو تغيرت البيانات من السيرفر (مثلاً عند التنقل بين الصفحات)، نعيد ضبط السيارات المعروضة
    useEffect(() => {
        let sorted = [...cars.data];

        switch (sortOption) {
            case "price-low-to-high":
                sorted.sort((a, b) => a.price - b.price);
                break;
            case "price-high-to-low":
                sorted.sort((a, b) => b.price - a.price);
                break;
            case "rating-high-to-low":
                sorted.sort((a, b) => b.rates - a.rates);
                break;
            case "rating-low-to-high":
                sorted.sort((a, b) => a.rates - b.rates);
                break;
            default:
                break;
        }

        setVisibleCars(sorted);
    }, [cars, sortOption]);

    const renderPaginationItems = () => {
        const items = [];

        // Always show first page
        items.push(
            <PaginationItem key="first">
                <PaginationLink
                    onClick={() => handlePageChange(1)}
                    isActive={currentPageState === 1}
                    className="cursor-pointer"
                >
                    1
                </PaginationLink>
            </PaginationItem>
        );

        // Show ellipsis if needed
        if (currentPageState > 3) {
            items.push(
                <PaginationItem key="ellipsis-1">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Show current page and surrounding pages
        for (
            let i = Math.max(2, currentPageState - 1);
            i <= Math.min(totalPages - 1, currentPageState + 1);
            i++
        ) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => handlePageChange(i)}
                        isActive={currentPageState === i}
                        className="cursor-pointer"
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Show ellipsis if needed
        if (currentPageState < totalPages - 2) {
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
                        isActive={currentPageState === totalPages}
                        className="cursor-pointer"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    const handlePageChange = (newPage) => {
        // للتحقق من القيمة
        const data = {
            page: newPage || 1,
        };

        if (selectedCompanyId) {
            data.company_id = selectedCompanyId;
        }

        router.get(route("cars.my"), data, {
            preserveScroll: true,
            preserveState: true,
        });

        setCurrentPageState(newPage);
    };

    const loadUserCompanies = async (page = 1) => {
        const res = await axios.get(route("user.company.paginated"), {
            params: { page },
        });

        const newUserCompanies = res.data.data; // لأنه paginate() يرجع الكيّ الأساسي هو data
        if (page === 1) {
            setNewUserCompanies(newUserCompanies);
        } else {
            setNewUserCompanies((prev) => [...prev, ...newUserCompanies]);
        }

        setCurrentPage(page);
        setHasMore(res.data.next_page_url !== null);
    };

    useEffect(() => {
        loadUserCompanies(1);
    }, []);
    return (
        <>
            <Head
                title={
                    cars.data.length > 0
                        ? `My Cars (${cars.data.length})`
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
                        resetpassstatus={resetpassstatus || ""} // Ensure it's a string
                    />
                </Suspense>

                <div className="container mx-auto py-10">
                    <h1 className="text-3xl font-bold mb-6">My Cars</h1>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button
                                            variant="outline"
                                            className="gap-1 p-1 xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[6px] xs-s-range:leading-[6px]"
                                        >
                                            <Filter className="h-4 w-4" />
                                            {selectedMake?.company_name
                                                ? `Company: ${selectedMake.company_name}`
                                                : "Filter By Company"}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>
                                            Filter By Company
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <ScrollArea className="h-[300px]">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedMake(null);
                                                        handleCompanyFilter(
                                                            null
                                                        );
                                                    }}
                                                    className={
                                                        !selectedMake
                                                            ? "bg-muted"
                                                            : ""
                                                    }
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center">
                                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs font-bold">
                                                                All
                                                            </div>
                                                            <span>
                                                                All Brands
                                                            </span>
                                                        </div>
                                                        {!selectedMake && (
                                                            <Check className="h-4 w-4 ml-2" />
                                                        )}
                                                    </div>
                                                </DropdownMenuItem>

                                                {NewUserCompanies.map(
                                                    (make) => (
                                                        <DropdownMenuItem
                                                            key={make.id}
                                                            onClick={() => {
                                                                setSelectedMake(
                                                                    make
                                                                );
                                                                handleCompanyFilter(
                                                                    make.id
                                                                ); // فلترة الباك
                                                            }}
                                                            className={
                                                                selectedMake?.id ===
                                                                make.id
                                                                    ? "bg-muted"
                                                                    : ""
                                                            }
                                                        >
                                                            <div className="flex items-center justify-between w-full">
                                                                <div className="flex items-center">
                                                                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2 relative">
                                                                        <LazyLoadImage
                                                                            src={`/storage/${make.logo_path}`}
                                                                            alt={
                                                                                make.company_name
                                                                            }
                                                                            className="object-cover w-full h-full"
                                                                            effect="blur"
                                                                        />
                                                                    </div>
                                                                    <span>
                                                                        {
                                                                            make.company_name
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {selectedMake?.id ===
                                                                    make.id && (
                                                                    <Check className="h-4 w-4 ml-2" />
                                                                )}
                                                            </div>
                                                        </DropdownMenuItem>
                                                    )
                                                )}

                                                {hasMore && (
                                                    <div className="flex justify-center py-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                loadUserCompanies(
                                                                    currentpage +
                                                                        1
                                                                )
                                                            }
                                                            className="flex items-center gap-1"
                                                        >
                                                            Load More
                                                            <ChevronDown className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </DropdownMenuGroup>
                                        </ScrollArea>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="gap-2 p-1 xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]"
                                        >
                                            <Filter className="h-4 w-4" />
                                            {sortOption === "default"
                                                ? "Sort By"
                                                : sortOption}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>
                                            Sort By
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleSortChange("default")
                                                }
                                            >
                                                Default
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleSortChange(
                                                        "price-low-to-high"
                                                    )
                                                }
                                            >
                                                Price: Low to High
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleSortChange(
                                                        "price-high-to-low"
                                                    )
                                                }
                                            >
                                                Price: High to Low
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleSortChange(
                                                        "rating-high-to-low"
                                                    )
                                                }
                                            >
                                                Rating: High to Low
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleSortChange(
                                                        "rating-low-to-high"
                                                    )
                                                }
                                            >
                                                Rating: Low to High
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div>
                                <Button
                                    className="mr-2 p-1 xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[6px] xs-s-range:leading-[6px] text-white"
                                    onClick={handleSellCarClick}
                                >
                                    <Plus className="mr-2 h-4 w-4 xs-s-range:w-2 xs-s-range:h-2" />
                                    Add New Car
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {visibleCars.map((car) => (
                                <CarCard
                                    key={car.id}
                                    car={car}
                                    currentPage={currentPageState}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </div>

                        {cars.data.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">
                                    You don't have any cars yet. Add your first
                                    car!
                                </p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() =>
                                                    handlePageChange(
                                                        Math.max(
                                                            1,
                                                            currentPageState - 1
                                                        )
                                                    )
                                                }
                                                className={
                                                    currentPageState === 1
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>

                                        {renderPaginationItems()}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() =>
                                                    handlePageChange(
                                                        Math.min(
                                                            totalPages,
                                                            currentPageState + 1
                                                        )
                                                    )
                                                }
                                                className={
                                                    currentPageState ===
                                                    totalPages
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>

                    <AlertDialog
                        open={isDialogOpen && success !== null}
                        onOpenChange={setIsDialogOpen}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Status Changed Successfully
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {success}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogAction className="text-white">
                                    OK
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </>
    );
};

export default UserCars;
