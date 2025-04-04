import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { ArrowDownWideNarrow, ChevronUp, Eye, LogIn, Star} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NavBar from '@/Components/NavBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Inertia } from '@inertiajs/inertia';
import RatingStars from '@/Components/RatingStars';

const CarSearchResults = ({auth,cars,totalResults,hasVerifiedEmail}) => {
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [sortDialogOpen, setSortDialogOpen] = useState(false)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [visibleCars, setVisibleCars] = useState(0);
   // Get body_type from URL
   const queryParams = new URLSearchParams(window.location.search);
   const sortoption = queryParams.get("sort");
   const [pendingSortOption, setPendingSortOption] = useState(sortoption || "posted");
   const { currency } = usePage().props;
    const { resetpassstatus } = usePage().props;
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollButton(true)
      } else {
        setShowScrollButton(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  useEffect(() => {
    const handleScroll = () => {
      // الحصول على كل البطاقات
      const cards = document.querySelectorAll('.car-card'); 
      
      let count = 0;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          count++;
        }
      });
  
      setVisibleCars(count);
    };
  
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // لتحديث العدد فور تحميل الصفحة
  
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const applySorting = () => {
    setSortDialogOpen(false);
    Inertia.visit(route('cars.byBodyType', { 
        body_type:queryParams.get("body_type"),
        brand_name:queryParams.get("brand_name"),
        model_name:queryParams.get("model_name"),
        maxPrice :queryParams.get("maxPrice"),
        category:queryParams.get("category"),
        currency:currency,
        sort: pendingSortOption 
    }), { preserveState: true });
  };
  
const getSortLabel = (value) => {
  const options = {
    "posted": "Posted (Newest First)",
    "price-low": "Price: Low to High",
    "price-high": "Price: High to Low",
    "year-new": "Year: Newest First",
    "year-old": "Year: Oldest First",
    "mileage-low": "Mileage: Low to High",
    "mileage-high": "Mileage: High to Low",
  }
  return options[value] || "Sort"
}
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
  const handleSellCarClick = () => {
      if (auth?.user && hasVerifiedEmail) {
        Inertia.visit(route('createcar'));
      } else {
        setLoginDialogOpen(true)
      }
    };
  return (
    <>
    <Head title={cars.length > 0 ? cars[0].model : "No Cars"} />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     <NavBar auth={auth} hasVerifiedEmail ={hasVerifiedEmail} currency = {currency} resetpassstatus={resetpassstatus}/>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
  {cars.length === 0 ? (
    // Display message if no cars are available
    <div className="flex justify-center items-center h-64 text-lg text-gray-500">
      <p>There are no cars yet</p>
    </div>
  ) : (
    // Display the list of cars if available
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {cars.map((car) => (
        <Card key={car.id} className="overflow-hidden hover:shadow-md transition-shadow car-card">
          <div className="relative aspect-[4/3] bg-gray-100">
            {car.images && car.images.length > 0 && (
              <img
                src={`/storage/${car.images[0].image_path}`}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="object-cover w-full h-full"
              />
            )}
             <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
            onClick={() => {
              router.visit(route("car.show", { car: car.id }));  // Use { car: car.id }
            }}>
                <Eye  className="w-4 h-4 text-gray-500" />
                </button>
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg xs-range:text-sm xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                {car.year} {car.brand} {car.model}
              </h3>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2 ">
            <div className='flex items-center gab-1 justify-center'>
            <span className='font-bold text-xs xs-s-range:text-[8px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]'>{car.mileage} km</span>
            <span className="mx-1 xs-s-range:text-[9px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">•</span>
            </div>
              <span className="text-xs font-bold xs-s-range:text-[8px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">
                {car.description && car.description.split(' ').length > 4
                  ? `${car.description.split(' ').slice(0, 4).join(' ')}...`
                  : car.description}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2 xs-s-range:text-[9px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">
          {car.tags && car.tags.length > 0 ? (
            <div className="flex gap-2">
              {car.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="bg-gray-200 px-2 py-1 rounded-full text-xs text-gray-600 xs-s-range:text-[9px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]"
                >
                  {tag.name}
                </span>
              ))}
              {car.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{car.tags.length - 3} more</span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-500 xs-s-range:text-[9px] xs-s-range:leading-[8px]">{car.model}</span>
          )}
        </div>
            <div className="flex items-center justify-between">
                <span className="text-blue-500 font-medium xs-range:text-xs xs-s-range:text-[8px] xs-s-range:leading-[8px]">
                    {car.currency === "USD" 
                    ? new Intl.NumberFormat('en-US').format(car.price).replace(/,/g, '.') + " USD"  
                    : new Intl.NumberFormat('en-US').format(car.price).replace(/,/g, '.') + " SYP"}
                </span>
                <div className="flex xs-range:text-xs">
                   <RatingStars rating={car.rates} size="sm" interactive={false} />
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
          <Button variant="outline" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white hover:text-white
          -mt-3" onClick={() => setSortDialogOpen(true)}>
            <ArrowDownWideNarrow className="h-4 w-4" />
            <span>{sortoption ? getSortLabel(sortoption) : "Posted"}</span>

          </Button>
          <div className="flex items-center gap-3">
            {showScrollButton && (
              <Button
                onClick={scrollToTop}
                className="rounded-full w-8 h-8 bg-blue-500 hover:bg-blue-600 flex items-center justify-center"
                aria-label="Scroll to top"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            <div className="text-sm text-gray-500">
            {visibleCars}/{totalResults} vehicles
            </div>
          </div>
        </div>
      </div>

      {/* Sort Dialog */}
      <Dialog open={sortDialogOpen} onOpenChange={setSortDialogOpen}>
            <DialogContent className="sm:max-w-md xs-range:max-w-xs">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">Sort By</DialogTitle>
              </DialogHeader>
              <div className="py-4">
          <RadioGroup
            value={pendingSortOption}
            onValueChange={setPendingSortOption}
            className="space-y-4"
          >
            {/* Default Sorting */}
            <div className="flex items-center space-x-2 border-b pb-4">
              <RadioGroupItem value="posted" id="posted" />
              <Label htmlFor="posted" className="font-medium">
                Posted (Newest First)
              </Label>
            </div>

            {/* Price Sorting */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold">Price</h3>
              <div className="flex items-center space-x-2 pl-4">
                <RadioGroupItem value="price-low" id="price-low" />
                <Label htmlFor="price-low">Low to High</Label>
              </div>
              <div className="flex items-center space-x-2 pl-4">
                <RadioGroupItem value="price-high" id="price-high" />
                <Label htmlFor="price-high">High to Low</Label>
              </div>
            </div>

            {/* Year Sorting */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold">Year</h3>
              <div className="flex items-center space-x-2 pl-4">
                <RadioGroupItem value="year-new" id="year-new" />
                <Label htmlFor="year-new">Newest First</Label>
              </div>
              <div className="flex items-center space-x-2 pl-4">
                <RadioGroupItem value="year-old" id="year-old" />
                <Label htmlFor="year-old">Oldest First</Label>
              </div>
            </div>

            {/* Mileage Sorting */}
            <div className="space-y-4">
              <h3 className="font-semibold">Mileage</h3>
              <div className="flex items-center space-x-2 pl-4">
                <RadioGroupItem value="mileage-low" id="mileage-low" />
                <Label htmlFor="mileage-low">Low to High</Label>
              </div>
              <div className="flex items-center space-x-2 pl-4">
                <RadioGroupItem value="mileage-high" id="mileage-high" />
                <Label htmlFor="mileage-high">High to Low</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
              <div className="flex justify-center">
              <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={applySorting}>
                  Apply
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-rose-100 p-3 mb-4">
              <LogIn className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-center text-gray-500 mb-6">You need to login to sell your car on SyartiSy.</p>
            <p className="text-center text-gray-500 mb-6">Pleace Click on Menu Button</p>
          </div>
        </DialogContent>
      </Dialog>
      </main>

      {/* Sell button */}
      {showScrollButton && (
  <Button
    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 rounded-full px-8 py-6 bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center z-50 md:left-auto md:right-6 md:bottom-24"
    aria-label="Sell"
    onClick={handleSellCarClick}
  >
    Sell
  </Button>
    )}
    </div>
    </>
  )
}

export default CarSearchResults
