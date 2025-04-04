import NavBar from '@/Components/NavBar';
import RatingStars from '@/Components/RatingStars';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { UserRatingForm } from '@/Components/UserRatingForm';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Filter, Mail, MapPin, Phone, Star, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const CompanyDetails = ({auth,company,hasVerifiedEmail,reviewsByUser,sortOption}) => {
    const [showRatingForm, setShowRatingForm] = useState(false)
    const [selectedSort, setSelectedSort] = useState(sortOption);
    const [showPhoneNumber, setShowPhoneNumber] = useState(false);
    const [activeTab, setActiveTab] = useState("cars")
     const { currency } = usePage().props;
      const { resetpassstatus } = usePage().props;
     const companyReviewsCount = company.reviews.filter(review => review.comment).length;
     console.log(company)
    const handleButtonClick = () => {
        setShowPhoneNumber(true);
      };
      
  useEffect(() => {
    setSelectedSort(sortOption); // Ensure state updates when navigating
  }, [sortOption]);

  const handleSortChange = (value) => {
    setSelectedSort(value);
    router.visit(`/company/${company.id}?sort=${value}`, {
      replace: true,
      preserveState: true, 
      only: ["company", "sortOption"], 
    });
  }
    return (
      <>
      <Head title={company.company_name} />
        <div className="min-h-screen bg-gray-50">
        <NavBar auth={auth} hasVerifiedEmail ={hasVerifiedEmail} currency = {currency} resetpassstatus = {resetpassstatus}/>
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border flex-shrink-0">
                <img
                  src={`/storage/${company.logo_path}`}
                  alt={company.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{company.company_name}</h1>
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
                    <a href={`tel:${company.user.phone}`} className="w-full">
                        Call {company.user.phone}
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
              <span className="text-gray-700">{company.user.phone}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700">{company.user.email}</span>
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
          <TabsTrigger value="cars">Cars ({company.cars.length})</TabsTrigger>
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
            {company.cars.map((car) => (
              <Link href={`/car/${car.id}`} key={car.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="relative aspect-[4/3] w-full">
                    <img src={`/storage/${car.images[0].image_path}`} alt={car.name} fill className="object-cover h-full w-full" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white bg-opacity-90 rounded-full px-2 py-1">
                      <div className="relative w-5 h-5 rounded-full overflow-hidden">
                        <img
                            src={`/storage/${company.logo_path}`}
                          alt={company.company_name}
                          fill
                          className="object-cover"
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
                     <RatingStars rating={car.rates} size="sm" />
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
        </div>
        </TabsContent>
         <TabsContent value="reviews" className="mt-0 xs-s-range:text-xs xs-range:text-xs">
                      <Card>
                        <CardContent className="pt-6 xs-s-range:text-xs">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-lg font-semibold xs-range:text-xs xs-s-range:text-xs">Customer Reviews</h3>
                              <div className="flex items-center mt-1">
                                <RatingStars rating={company.rates} />
                                <span className="ml-2 text-sm font-medium xs-range:text-xs xs-s-range:text-xs">{company.rates} out of 5</span>
                                <span className="ml-2 text-sm text-gray-500 xs-range:text-xs xs-s-range:text-xs">{companyReviewsCount} Review</span>
                              </div>
                            </div>
                            <Button variant="outline" onClick={() => setShowRatingForm(true)}>
                              Write a Review
                            </Button>
                          </div>
        
                          <div className="space-y-6 xs-s-range:text-xs">
                      {Object.entries(reviewsByUser).map(([userId, userReviews]) => {
                        // Filter reviews to include only those with a comment
                        const filteredReviews = userReviews.filter((review) => review.comment && review.comment.trim() !== "");
        
                        // Skip rendering if no reviews contain a comment
                        if (filteredReviews.length === 0) return null;
                      return (
                              <div key={userId} className="pb-6">
                                {filteredReviews.map((review) => (
                                  <div key={review.id} className="flex items-start gap-4 border-b last:border-0 mb-2">
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
                            );
                          })}
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
