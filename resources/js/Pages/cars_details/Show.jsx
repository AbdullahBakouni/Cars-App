import React, { lazy, Suspense, useEffect } from 'react'
import { useState } from "react"
import { X, ChevronLeft, ChevronRight, MessageCircle, Phone, Eye, ChevronDown} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRatingForm } from '@/Components/UserRatingForm' 
import { ShareButton } from '@/Components/ShareButton'
import { Head, router, usePage } from '@inertiajs/react'
import { Avatar, AvatarFallback} from '@/Components/ui/avatar'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import axios from 'axios'
import RatingStars from '@/Components/RatingStars'
const Show = ({auth,car,suggestedCars,hasVerifiedEmail}) => {
    const [showGallery, setShowGallery] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showRatingForm, setShowRatingForm] = useState(false)
    const { currency } = usePage().props;
     const { resetpassstatus } = usePage().props;
    const [showPhoneNumber, setShowPhoneNumber] = useState(false);
    const [showWhatsapp, setShowWhatsapp] = useState(false);
    const carReviewsCount = car.reviews.filter(review =>review.comment).length;
    const companyReviewsCount = car.company?.reviews?.filter(review => review.comment)?.length || 0;
    const carFuel = car.fuel ? car.fuel.toUpperCase() : 'ELECTRIC';
    const NavBar = lazy(() => import("@/Components/NavBar"));
    const [reviews, setReviews] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const handleCompanyClick = (companyId) => {
      axios.post('/companies/session', { company_id: companyId })
          .then(response => {
              const redirectUrl = response.data.redirect;
              router.visit(redirectUrl);
          })
          .catch(error => {
              console.error('Failed to set car session:', error);
          });
  };
  const loadCarReviews = async (page = 1) => {
    const res = await axios.get(route('cars.reviews.paginated', car.id), { params: { page } })
    const newReviews = res.data.reviews.data;
    if (page === 1) {
      setReviews(newReviews)
    } else {
      setReviews(prev => [...prev, ...newReviews])
    }

    setCurrentPage(page)
    setHasMore(res.data.reviews.next_page_url !== null)
  }

  useEffect(() => {
    loadCarReviews(1)
  }, []);

    const handleButtonClick = () => {
      setShowPhoneNumber(true);
    };
    const handleWhatsappClick = () => {
        const phoneNumber = car.phone.number
    
        // Ensure the phone number is in the correct format (no spaces, parentheses, or dashes)
        const formattedPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-numeric characters
    
        // On mobile, the whatsapp:// URL will open WhatsApp directly with the number
        const whatsappUrl = `whatsapp://send?phone=${formattedPhoneNumber}`;
        // On desktop, use the web version of WhatsApp
        const whatsappWebUrl = `https://wa.me/${formattedPhoneNumber}`;
    
        // Check if the device is mobile or not
        const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    
        if (isMobile) {
          // On mobile, try to open WhatsApp using the whatsapp:// URI
          window.location.href = whatsappUrl;
        } else {
          // On desktop, open WhatsApp Web
          window.open(whatsappWebUrl, "_blank");
        }
      };
    return (
        <>
        <Head title={car.brand} />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            {/* Images Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {car.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index)
                    setShowGallery(true)
                  }}
                >
                    <LazyLoadImage
                     src={`/storage/${image.image_path}`}
                     alt={`Car${index + 1}`}
                    className="object-cover h-full w-full aspect-square"
                    effect="blur"
                    />
                </div>
              ))}
            </div>
  
            {/* Company Info - Below images */}
            {car.company.company_name && (
          <div className="mt-4 p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 cursor-pointer"
                 onClick={() => handleCompanyClick(car.company.id)}>
                   <LazyLoadImage
                    src={`/storage/${car.company.logo_path}`} 
                    alt={`${car.company.company_name} Logo`} 
                    className="object-cover" 
                    effect="blur"
                    />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-blue-600">{car.company.company_name}</h2>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  <span className="text-xs font-medium mr-1">Rating:</span>
                   
                      <RatingStars rating={car.company.rates || ""} size="sm" interactive={false} />

                  <span className="ml-1 text-xs text-gray-600">{companyReviewsCount} Review</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs h-8"
                  onClick={() => setShowRatingForm(true)}
                >
                  Rate Company
                </Button>
              </div>
            </div>
          </div>
        )}

  
            {/* Car Title and Rating */}
            <div className="mt-8">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-2xl md:text-3xl font-bold"> {car.brand} {car.model} {car.year}</h1>
                <div className="flex items-center">
               
                      <RatingStars rating={car.rates || ""} size="sm" interactive={false} />
                     
                  <span className="ml-2 text-sm text-gray-600">{carReviewsCount} review</span>
                </div>
              </div>
              <p className="text-lg text-gray-700 mt-1">
              {car.brand} {car.model} {car.transmission} /{car.year} /{car.body_type}/{car.condition}
              </p>
            </div>
  
            {/* Tabs for Description, Specifications, etc. */}
            <Tabs defaultValue="description" className="mt-8">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({carReviewsCount})</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-0 xs-s-range:text-xs xs-range:text-xs">
                <Card>
                  <CardContent className="pt-6">
                  <p 
                    className={`text-gray-700 mb-4 ${
                      /[\u0600-\u06FF]/.test(car.description) ? "text-right" : "text-left"
                    }`}
                  >
                    {car.description}
                  </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="specifications" className="mt-0 xs-s-range:text-xs xs-range:text-xs">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Make:</span>
                          <span>{car.brand}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Model:</span>
                          <span>{car.model}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Location:</span>
                          <span>{car.location}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Year:</span>
                          <span>{car.year}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Mileage:</span>
                          <span>{car.mileage} Km</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Status:</span>
                          <span> For {car.status}{car.rental_type ? ` · ${car.rental_type}` : ''}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Engine:</span>
                          <span>{(car.engine / 1000).toFixed(1)}L</span>
                        </div>

                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Cylinders:</span>
                          <span>{car.fuel ? `V${car.cylinders}` : 'V0'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Fuel:</span>
                          <span>{car.fuel ? car.fuel : 'Battery'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Transmission:</span>
                          <span>{car.transmission}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Color:</span>
                          <span>{car.color}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Doors:</span>
                          <span>{car.doors}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews" className="mt-0 xs-s-range:text-xs xs-range:text-xs">
              <Card>
                <CardContent className="pt-6 xs-s-range:text-xs">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold xs-range:text-xs xs-s-range:text-xs">Customer Reviews</h3>
                      <div className="flex items-center mt-1">
                        <RatingStars rating={car.rates} />
                        <span className="ml-2 text-sm font-medium xs-range:text-xs xs-s-range:text-xs">{car.rates} out of 5</span>
                        <span className="ml-2 text-sm text-gray-500 xs-range:text-xs xs-s-range:text-xs">{carReviewsCount} Review</span>
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
          onClick={() => loadReviews(currentPage + 1)}
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
  
            <div className="mt-8">
              <Button variant="outline" size="lg" className="w-full" onClick={() => setShowRatingForm(true)}>
                Rate This Car
              </Button>
            </div>
          </div>
  
          {/* Right Column - Price and Contact */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-600 text-lg">Price</span>
                  <div className="text-right">
                  {car.currency === "USD" ? (
                        <span className="text-3xl font-bold text-primary">{car.price} USD</span>
                    ) : (
                        <span className="text-3xl font-bold text-primary">{car.price} SYP</span>
                    )}
                  </div>
                </div>
  
                <Button className="w-full mb-3 bg-green-600 hover:bg-green-700" onClick={handleWhatsappClick}>
                  <MessageCircle className="mr-2 h-4 w-4" /> {showWhatsapp ? (
                     <span>Contact on WhatsApp</span>
                ) : (
                    <span>Whatsapp</span>
                )}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleButtonClick}>
                  <Phone className="mr-2 h-4 w-4" />   {showPhoneNumber ? (
                    <a href={`tel:${car.phone.number}`} className="w-full">
                        Call {car.phone.number}
                    </a>
                    ) : (
                    "Show Number"
                    )}
                </Button>
  
                <Separator className="my-6" />
  
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Year</div>
                    <div className="text-right font-medium">{car.year}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Make</div>
                    <div className="text-right font-medium">{car.brand}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Model</div>
                    <div className="text-right font-medium">{car.model}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Mileage</div>
                    <div className="text-right font-medium">{car.mileage} km</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Cylinders</div>
                    <div className="text-right font-medium">{car.cylinders}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Transmission</div>
                    <div className="text-right font-medium">{car.transmission}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Type</div>
                    <div className="text-right font-medium">{car.body_type.toUpperCase()}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Doors</div>
                    <div className="text-right font-medium">{car.doors}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Color</div>
                    <div className="text-right font-medium">{car.color}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-600">Fuel</div>
                    <div className="text-right font-medium">{car.fuel ? car.fuel : 'Battery'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
            
        <div className="mt-16">
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-lg font-bold text-gray-800 italic">Suggested</span>
        </div>
      </div>
      <div>
  {suggestedCars.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {suggestedCars.map((car) => (
        <Card key={car.id} className="overflow-hidden hover:shadow-md transition-shadow car-card">
          <div className="relative aspect-[4/3] bg-gray-100">
            {car.images && car.images.length > 0 && (
              <img
                src={`/storage/${car.images[0].image_path}`}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="object-cover w-full h-full"
              />
            )}
            <button
              className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
              onClick={() => router.visit(route("car.show", car.id))}
            >
              <Eye className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg xs-range:text-sm xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                {car.year} {car.brand} {car.model}
              </h3>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1 justify-center">
                <span className="font-bold text-xs">{car.mileage} km</span>
                <span className="mx-1">•</span>
              </div>
              <span className="text-xs font-bold">
                {car.description && car.description.split(" ").length > 4
                  ? `${car.description.split(" ").slice(0, 4).join(" ")}...`
                  : car.description}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              {car.tags && car.tags.length > 0 ? (
                <div className="flex gap-2">
                  {car.tags.map((tag) => (
                    <span key={tag.id} className="bg-gray-200 px-2 py-1 rounded-full text-xs text-gray-600">
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500">{car.model}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-500 font-medium">
                {car.currency === "USD"
                  ? new Intl.NumberFormat("en-US").format(car.price).replace(/,/g, ".") + " USD"
                  : new Intl.NumberFormat("en-US").format(car.price).replace(/,/g, ".") + " SYP"}
              </span>
              <div className="flex">
                <RatingStars rating={car.rates} size="sm" interactive={false} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ) : (
    <div className="text-center text-gray-500 text-lg mt-6">There are no Cars Yet.</div>
  )}
</div>

    </div>


        {/* Share Button */}
        <ShareButton />
  
        {/* Full Screen Image Gallery */}
        {showGallery && (
  <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
    <div className="flex justify-between items-center p-4">
      <span className="text-white">
        {currentImageIndex + 1} / {car.images.length}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowGallery(false)}
        className="text-white hover:bg-gray-800"
      >
        <X className="h-6 w-6" />
      </Button>
    </div>
    <div className="flex-1 flex items-center justify-center relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 z-10 text-white hover:bg-gray-800"
        onClick={() =>
          setCurrentImageIndex((prev) => (prev === 0 ? car.images.length - 1 : prev - 1))
        }
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <div className="relative h-full max-h-[70vh] w-full max-w-xl mx-auto xs-range:max-w-sm">
        <img
         src={`/storage/${car.images[currentImageIndex]?.image_path || "placeholder.svg"}`}
          alt={`Car Image ${currentImageIndex + 1}`}
          className="object-contain h-full w-full"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 z-10 text-white hover:bg-gray-800"
        onClick={() =>
          setCurrentImageIndex((prev) => (prev === car.images.length - 1 ? 0 : prev + 1))
        }
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </div>
    <div className="p-4 overflow-x-auto">
      <div className="flex gap-2">
        {car.images.map((image, index) => (
          <div
            key={index}
            className={`relative w-20 h-20 flex-shrink-0 cursor-pointer ${
              currentImageIndex === index ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setCurrentImageIndex(index)}
          >
            <img
              src={`/storage/${image.image_path}`}
              alt={`Thumbnail ${index + 1}`}
              className="object-cover h-full w-full"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)}

  
        {/* Rating Form Modal */}
        {showRatingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Rate Your Experience</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowRatingForm(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <UserRatingForm onClose={() => setShowRatingForm(false)} CarBrand = {car.brand} CarModel = {car.model} CarId = {car.id} CompanyId = {car.company.id} CompanyName = {car.company.company_name} auth={auth} reloadReviews={loadCarReviews}/>
            </div>
          </div>
        )}
      </div>
      </div>
      </>
    )
  
}

export default Show
