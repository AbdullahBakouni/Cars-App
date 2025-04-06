import { CarCard } from '@/Components/CarCard';
import { Button } from '@/Components/ui/button';
import { Inertia } from '@inertiajs/inertia';
import { Head, usePage } from '@inertiajs/react';
import { Plus , Filter} from "lucide-react";
import { useEffect, useState , lazy, Suspense} from 'react';
const NavBar = lazy(() => import("@/Components/NavBar"));
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
const UserCars = ({ auth, cars, hasVerifiedEmail}) => {
  const { currency } = usePage().props;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { success } = usePage().props;
  const { resetpassstatus } = usePage().props;

  const [sortOption, setSortOption] = useState("default");

  // Get pagination and car data from props
  const currentPage = cars.current_page;
  const totalPages = cars.last_page;
  const carsPerPage = cars.per_page;
  const totalCars = cars.total;
  useEffect(() => {
    const storedMessage = sessionStorage.getItem('successMessage');
    if (storedMessage) {
      setMessage(storedMessage);
      setIsDialogOpen(true);
    } else if (success) {
      sessionStorage.setItem('successMessage', success);
      setMessage(success);
      setIsDialogOpen(true);
    }
  }, [success]);


  const handleDelete = (id) => {
    Inertia.delete(route("cars.destroy", { car: id }));
  };

  const handleStatusChange = (id, newStatus) => {
    Inertia.get(route("cars.my"), { 
      car_id: id, 
      status: newStatus, 
      sort: sortOption, 
      page: currentPage 
    }, {
      preserveState: true,  // Preserve the state (sorting, pagination)
      preserveScroll: true  // Preserve scroll position
    });
  };
  
  const handleSellCarClick = () => {
    if (auth?.user && hasVerifiedEmail) {
      Inertia.visit(route('createcar'));
    } else {
      alert("Sorry You need to login");
    }
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    Inertia.get(route('cars.my'), { sort: option, page: currentPage }, {
      preserveState: true,  // Preserve the state (sorting, pagination)
      preserveScroll: true  // Preserve scroll position
    });
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
      </PaginationItem>,
    );
  
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
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
        </PaginationItem>,
      );
    }
  
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
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
        </PaginationItem>,
      );
    }
  
    return items;
  };
  
  
  const handlePageChange = (page) => {
    Inertia.get(route("cars.my"), { 
      page, 
      sort: sortOption 
    }, {
      preserveState: true,  // Preserve the state (sorting, pagination)
      preserveScroll: true  // Preserve scroll position
    });
  };
  

  return (
    <>
      <Head title={cars.data.length > 0 ? `My Cars (${cars.data.length})` : "No Cars"} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Suspense fallback={<div>Loading...</div>}>
        <NavBar
          auth={auth ? auth : ""}  // Ensure it's a string, or provide a default value
          hasVerifiedEmail={hasVerifiedEmail || false}  // Ensure it's a boolean
          currency={currency || "SYP"}  // Ensure it's a string
          resetpassstatus={resetpassstatus || ""}  // Ensure it's a string
        />
          </Suspense>

        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-6">My Cars ({totalCars})</h1>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Suspense fallback={<div>Loading...</div>}>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {sortOption === "default" ? "Sort By" : sortOption}
              </Button>
            </Suspense>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleSortChange("default")}>Default</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("price-low-to-high")}>
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("price-high-to-low")}>
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("rating-high-to-low")}>
                      Rating: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("rating-low-to-high")}>
                      Rating: Low to High
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground xs-s-range:text-[7px] xs-s-range:leading-[7px] xs-range:text-[8px] xs-range:leading-[8px]">
                  Showing {Math.min((currentPage - 1) * carsPerPage + 1, totalCars)} -{" "}
                  {Math.min(currentPage * carsPerPage, totalCars)} of {totalCars} cars
                </p>
                <Button className = "mr-3 xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]"
                  onClick={handleSellCarClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Car
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {cars.data.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {cars.data.length === 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You don't have any cars yet. Add your first car!</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {renderPaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserCars;
