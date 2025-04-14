import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Edit, Trash2, Car, Upload, X, ChevronDown, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LazyLoadImage } from "react-lazy-load-image-component"
import 'react-lazy-load-image-component/src/effects/blur.css';
import RatingStars from "./RatingStars"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Link, router, useForm } from "@inertiajs/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Badge } from "./ui/badge"
const CompanyCard = ({company,currentPage}) => {
  const [logoPreview, setLogoPreview] = useState(null)
  const [hasLogo, setHasLogo] = useState(!!company.logo_path)
  const { data, setData, post, processing, errors } = useForm({
    company_name: company.company_name,
    location: company.location,
    company_logo: null,
    page: currentPage, // <-- ضروري
    deleted_logo: false,
    _method: "PUT", // لو حذف الصورة
  })
  const [currentpage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [hasMoreCars, setHasMoreCars] = useState(true)
  const [cars, setCars] = useState([])
  const [reviews, setReviews] = useState([])

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

   const loadCars = async (page = 1) => {
    const res = await axios.get(route('company.cars.paginated', company.id), { params: { page } })
    const newCars = res.data.cars.data
    if (page === 1) {
      setCars(newCars)
    } else {
      setCars(prev => [...prev, ...newCars])
    }

    setCurrentPage(page)
    setHasMoreCars(res.data.cars.next_page_url !== null)
  }

  useEffect(() => {
    loadCars(1)
  }, []);
    const handleLogoDelete = (e) => {
    e.stopPropagation()
    setHasLogo(false)
    setLogoPreview(null)
    setData('company_logo', null)
    setData('deleted_logo', true)
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
        setHasLogo(true)
        setData('deleted_logo', false)
      }
      reader.readAsDataURL(file)
      setData('company_logo', file)
    }
  }
  const handleSubmit = (e) => {
    e.preventDefault();  // For debugging
    post(`/company/${company.id}`, data, {
      preserveScroll: true,
      preserveState: true,
    });
  }
  const handleDelete = (company) => {
    router.delete(route("company.destroy",  company.id ), {
      data: {
        page: currentPage,  // للحفاظ على الصفحة الحالية
      },
      preserveState: true,
      preserveScroll: true,
    });
  };
  
    return (
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Company Image and Basic Info */}
            <div className="relative md:col-span-1">
            <div className="flex items-center p-4 pb-0">
            <div className="relative w-16 h-16 rounded-md overflow-hidden mr-3 flex-shrink-0">
                 <LazyLoadImage
                src={`storage/${company.logo_path}`}
                alt={`${company.company_name}`}
                className="object-cover"
                effect="blur" // Optional effect for lazy loading
                />
                   {company?.rates >= 4.5 && (
                   <div className="absolute -bottom-1 -right-1">
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-blue-500 text-white rounded-full p-[2px] shadow-md">
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
              </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3"> 
                <h2 className="text-2xl font-bold">{company.company_name}</h2>
                {company?.rates >= 4.5 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Verified
              </Badge>
              )}
                </div>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{company.location}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                    <RatingStars rating={company.rates || ""} size="sm" interactive={false} />
                  <span className="ml-1 text-sm">({company.rates})</span>
                </div>
                <div className="flex gap-2 mt-4">
                <div className="p-4">
            <div className="flex gap-2 mt-2">
              {/* Changed from Popover to Dialog for centered edit form */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Company</DialogTitle>
                    <DialogDescription>Make changes to your company information here.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="border p-4 rounded-md shadow-sm space-y-4">
                  <div className="grid gap-4 py-4">
                    {/* Logo Section with Upload/Delete */}
                    <div className="flex flex-col items-center gap-2">
                      <Label htmlFor={`company-logo-${company.id}`} className="self-start">
                        Company Logo
                      </Label>

                      {hasLogo ? (
                        <div className="relative w-24 h-24 rounded-md overflow-hidden border group">
                           <LazyLoadImage
                          src={logoPreview || `/storage/${company.logo_path}`}
                          alt={`${company.company_name}`}
                          className="object-cover"
                          effect="blur" // Optional effect for lazy loading
                        />
                          <button
                            type="button"
                            onClick={handleLogoDelete}
                            className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete logo"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-md border-2 border-dashed flex items-center justify-center bg-muted">
                          <Label
                            htmlFor={`company-logo-${company.id}`}
                            className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground text-center">Upload Logo</span>
                          </Label>
                        </div>
                      )}

                      <Input
                        id={`company-logo-${company.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />

                      {hasLogo && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full mt-1"
                          onClick={() => document.getElementById(`company-logo-${company.id}`).click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Logo
                        </Button>
                      )}
                      {errors.company_logo && <p className="text-red-500 text-sm">{errors.company_logo}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`company-name-${company.id}`}>Company Name</Label>
                      <Input
                          id={`company-name-${company.id}`}
                          value={data.company_name}
                          onChange={(e) => setData('company_name', e.target.value)}
                        />
                          {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`company-location-${company.id}`}>Location</Label>
                      <Input
                        id={`company-location-${company.id}`}
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                      />
                      {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={processing}>
                            Save Changes
                    </Button>
                  </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete the company "{company.company_name}" and all
                      associated data.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex space-x-2 justify-end">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={() => handleDelete(company)}>Delete Company</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
                </div>
              </div>
            </div>
    
            {/* Tabs for Rates, Reviews, and Images */}
            <div className="md:col-span-2 p-4 pt-0 md:pt-4">
              <Tabs defaultValue="rates" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="rates">Rates</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
    
                {/* Rates Tab */}
                <TabsContent value="rates" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-2 xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                          <div className="flex justify-between items-center pb-2 border-b">
                           <div className="flex items-center gap-2">
                            <span className="font-semibold">Company Rates :</span>
                           <RatingStars rating={company.rates || ""} size="sm" interactive={false} />
                           </div>
                           <div className="flex items-center gap-2">
                            <span className="font-semibold">Total Reviews :</span>
                            <span className="font-semibold">{company.reviews_count}</span>
                           </div>
                          </div>
                      </div> 
                      <div className="mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full">
                              <Car className="mr-2 h-4 w-4" />
                              View Cars
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                <LazyLoadImage
                                src={`storage/${company.logo_path}`}
                                alt={`${company.company_name}`}
                                className="object-cover"
                                effect="blur" // Optional effect for lazy loading
                                />
                                </div>
                                <span>{company.company_name} - Available Cars</span>
                              </DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                              <div className="grid gap-3 p-1">
                                {cars.map((car) => (
                                  <div
                                    key={car.id}
                                    className="flex items-center gap-3 border rounded-md p-2 hover:bg-muted/50 transition-colors"
                                  >
                                    <Link href={`/car/${car.id}`} key={car.id}>
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                        <LazyLoadImage
                                        src={`storage/${car.images[0].image_path}`}
                                        alt={`${car.brand}`}
                                        className="object-cover aspect-square"
                                        effect="blur" // Optional effect for lazy loading
                                        />
                                    </div>
                                    </Link>
                                    <div className="flex-grow min-w-0">
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm truncate">{car.model}</h4>
                                        <span className="font-bold text-sm">{car.currency === "USD" 
                                        ? new Intl.NumberFormat('en-US').format(car.price).replace(/,/g, '.') + " USD"  
                                        : new Intl.NumberFormat('en-US').format(car.price).replace(/,/g, '.') + " SYP"}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <span>{car.year}</span>
                                        <span>•</span>
                                        <span>{car.color}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                  {hasMoreCars && (
                                    <div className="flex justify-center py-2">
                                        <Button
                                        variant="outline"
                                          size="sm"
                                          onClick={() => loadCars(currentpage + 1)}
                                          className="flex items-center gap-1"
                                          >
                                          Load More
                                        <ChevronDown className="h-3 w-3" />
                                      </Button>
                                      </div>
                                    )}
                              </div>
                            </ScrollArea>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline" size="sm">
                                  Close
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
    
                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent> 
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Card>
      )
}

export default CompanyCard
