
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { UserRatingForm } from '@/Components/UserRatingForm';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle, ChevronDown, Filter, MapPin, Phone, Star, UserRoundPen, X } from 'lucide-react';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
   const NavBar = lazy(() => import("@/Components/NavBar"));
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Inertia } from '@inertiajs/inertia';
import RatingStars from '@/Components/RatingStars';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Badge } from '@/Components/ui/badge';
const CompanyDetails = ({auth,company,cars,hasVerifiedEmail,sortOption}) => {
    const [showRatingForm, setShowRatingForm] = useState(false)
    const [selectedSort, setSelectedSort] = useState(sortOption);
    const [showPhoneNumber, setShowPhoneNumber] = useState(false);
    const [activeTab, setActiveTab] = useState("cars")
     const { currency } = usePage().props;
      const { resetpassstatus } = usePage().props;
     const companyReviewsCount = company.reviews.filter(review => review.comment).length;
     const currentPage = cars.current_page;
     const totalPages = cars.last_page;

     const [reviews, setReviews] = useState([])
     const [currentpage, setCurrentPage] = useState(1)
     const [hasMore, setHasMore] = useState(true)
     const [visibleCars, setVisibleCars] = useState(cars.data);
   const loadReviews = async (page = 1) => {
     const res = await axios.get(route('company.reviews.paginated', company.id), { params: { page } })
     const newReviews = res.data.reviews.data
     if (page === 1) {
       setReviews(newReviews)
     } else {
       setReviews(prev => [...prev, ...newReviews])
     }
 
     setCurrentPage(page)
     setHasMore(res.data.reviews.next_page_url !== null)
   }
 
   useEffect(() => {
     loadReviews(1)
   }, []);
    const handleButtonClick = () => {
        setShowPhoneNumber(true);
      };
      
  useEffect(() => {
    setSelectedSort(sortOption); // Ensure state updates when navigating
  }, [sortOption]);

  const handleSortChange = (value) => {
    if (!company?.id) return;
  
    setSelectedSort(value);
  
    const sortedCars = [...cars.data];
  
    switch (value) {
      case 'price-high':
        sortedCars.sort((a, b) => b.price - a.price);
        break;
  
      case 'price-low':
        sortedCars.sort((a, b) => a.price - b.price);
        break;
  
      case 'rating':
        sortedCars.sort((a, b) => b.rates - a.rates);
        break;
  
      case 'newest':
        sortedCars.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
  
      case 'featured':
      default:
        break; // ما نعمل شي لو "Featured"
    }
  
    setVisibleCars(sortedCars);
  };
  
  

  useEffect(() => {
    setVisibleCars(cars.data);
  }, [cars]);
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
      Inertia.get(route("company.show", company.id), {
        page,// يجب استخدام selectedSort وليس sortOption لأنه قد يتغير
      }, {
        preserveState: true,
        preserveScroll: true
      });
    };
    return (
      <>
      <Head title={company.company_name} />
        <div className="min-h-screen bg-gray-50">
       <Suspense fallback={<div>Loading...</div>}>
                           <NavBar
                             auth={auth ? auth : ""}  // Ensure it's a string, or provide a default value
                             hasVerifiedEmail={hasVerifiedEmail || false}  // Ensure it's a boolean
                             currency={currency || "SYP"}  // Ensure it's a string
                             resetpassstatus={resetpassstatus || ""}  // Ensure it's a string
                           />
                             </Suspense>
          <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
         <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Verification badge behind logo */}
                {company?.rates >= 4.5 && (
                <div className="absolute -right-2 -top-2 z-10">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-blue-500 text-white rounded-full p-1 shadow-md">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Dealer</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                )}
              <div className="relative w-20 h-20 rounded-full overflow-hidden border flex-shrink-0">
                  <LazyLoadImage
                 src={`/storage/${company.logo_path}`}
                 alt={company.name}
                  className="object-cover"
                  effect="blur" // Optional effect for lazy loading
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{company.company_name}</h1>
              {company?.rates >= 4.5 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Verified
              </Badge>
              )}
              </div>
              <div className="flex items-center mt-1">
                <RatingStars rating={company.rates} />
                <span className="ml-2 text-sm text-gray-600">({company.reviews.length} reviews)</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Established:</span> {new Date(company.created_at).toLocaleDateString()} •
              <span className="font-medium ml-2">Owner:</span> {company.user.name}
              </p>
            </div>
          </div>

            <div className="md:ml-auto flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" className="flex-1 sm:flex-initial" onClick={handleButtonClick}>
                <Phone className="mr-2 h-4 w-4" />{showPhoneNumber ? (
                    <a href={`tel:${company.user.phones[0].number}`} className="w-full">
                        Call {company.user.phones[0].number}
                    </a>
                    ) : (
                    "Show Number"
                    )}
              </Button>
              <Button className="flex-1 sm:flex-initial" onClick={() => setShowRatingForm(true)}>
                Rate This Company
              </Button>
            </div>
          </div>
  
          <Separator className="my-6" />
         
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{company.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700">{company.user.phones[0].number}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserRoundPen  className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700">{company.user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700"> Rates: {company.rates}</span>
            </div>
          </div>
        </div>
        </div>
        <Tabs defaultValue="cars" onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cars">Cars ({cars.data.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({companyReviewsCount})</TabsTrigger>
        </TabsList>
        
        {/* Cars Listing */}
        <TabsContent value="cars">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-bold">Available Cars</h2>
  
            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
                <Select 
                value={selectedSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCars.map((car) => (
              <Link href={`/car/${car.id}`} key={car.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="relative aspect-[4/3] w-full">
                    <img src={`/storage/${car.images[0].image_path}`} alt={car.name}  className="object-cover h-full w-full" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white bg-opacity-90 rounded-full px-2 py-1">
                      <div className="relative w-5 h-5 rounded-full overflow-hidden">
                         <LazyLoadImage
                        src={`/storage/${company.logo_path}`}
                        alt={company.company_name}
                        className="object-cover"
                        effect="blur"
                      />
                      </div>
                      <span className="text-xs font-medium">{company.company_name}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{car.year} {car.brand} {car.model}</h3>
                      <span className="font-bold text-primary"> {car.currency === "USD" 
                    ? new Intl.NumberFormat('en-US').format(car.price).replace(/,/g, '.') + " USD"  
                    : new Intl.NumberFormat('en-US').format(car.price).replace(/,/g, '.') + " SYP"}</span>
                    </div>
                    <div className="flex items-center mt-1 justify-between">
                     <div className='flex items-center'>
                                          
                           <RatingStars rating={car.rates || ""} size="sm"/>
                                        
                     <span className="ml-1 text-xs text-gray-500">({car.rates})</span>
                     </div>
                      <div>
                      <span className="text-xs font-semibold xs-s-range:text-[8px] xs-s-range:leading-[8px] xs-range:text-[12px] xs-range:leading-[12px]">
                                {car.description && car.description.split(' ').length > 4
                                ? `${car.description.split(' ').slice(0, 4).join(' ')}...`
                                : car.description}
                            </span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-gray-500 font-semibold">
                      <span>{car.year}</span>
                      <span>{car.mileage} KM</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
        </TabsContent>
                  <TabsContent value="reviews" className="mt-0 xs-s-range:text-xs xs-range:text-xs">
                      <Card>
                        <CardContent className="pt-6 xs-s-range:text-xs">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-lg font-semibold xs-range:text-xs xs-s-range:text-xs">Customer Reviews</h3>
                              <div className="flex items-center mt-1">
                            
                                      <RatingStars rating={company.rates || ""} size="sm" interactive={false} />
                                
                                <span className="ml-2 text-sm font-medium xs-range:text-xs xs-s-range:text-xs">{company.rates} out of 5</span>
                                <span className="ml-2 text-sm text-gray-500 xs-range:text-xs xs-s-range:text-xs">{companyReviewsCount} Review</span>
                              </div>
                            </div>
                            <Button variant="outline" onClick={() => setShowRatingForm(true)}>
                              Write a Review
                            </Button>
                          </div>
        
                          <div className="space-y-6 xs-s-range:text-xs">
                               <div className="pb-6">
                                          {reviews.map((review, index) => (
                                    <div key={`${review.id}-${index}`} className="flex items-start gap-4 border-b last:border-0 mb-2">
                                            <Avatar className="h-10 w-10">
                                              <AvatarFallback>
                                          {review.user.name.charAt(0)}
                                          {review.user.name.split(" ")[1]?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                      <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                          <div>
                                            <h4 className="font-medium">{review.user.name}</h4>
                                            <div className="flex items-center mt-1">
                                              <RatingStars rating={review.rating || 0} size="sm" />
                                              <span className="ml-2 text-xs text-gray-500">
                                                {new Date(review.created_at).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="mt-2 text-gray-700 mb-2">{review.comment}</p>
                                      </div>
                                    </div>
                                  ))}
                                  </div>
                                  {hasMore && (
                <div className="flex justify-center py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadReviews(currentpage + 1)}
                    className="flex items-center gap-1"
                  >
                    Load More
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              )}
                        </div>
                        </CardContent>
                      </Card>
           </TabsContent>
      </Tabs>
        {/* Rating Form Modal */}
        {showRatingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Rate {company.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowRatingForm(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <UserRatingForm onClose={() => setShowRatingForm(false)}
              auth={auth}
              CompanyId = {company.id} 
              CompanyName = {company.company_name} />
            </div>
          </div>
        )}
      </div>
      </div>
      </>
    )
}

export default CompanyDetails
