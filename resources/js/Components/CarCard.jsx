

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Edit,
  Trash2,
  MoreVertical,
  Tag,
  Calendar,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { router } from "@inertiajs/react"
import RatingStars from "./RatingStars"
import { LazyLoadImage } from "react-lazy-load-image-component"
import 'react-lazy-load-image-component/src/effects/blur.css';
import ReviewsDialog from "./ReviewsDialog"
import axios from "axios"
export function CarCard({ car,onStatusChange,currentPage}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMarkAsSoldDialogOpen, setIsMarkAsSoldDialogOpen] = useState(false)
  const [statusToChangeTo, setStatusToChangeTo] = useState(null)

  const handleCardClick = (carId) => {
    axios.post('/cars/session', { car_id: carId })
        .then(response => {
            const redirectUrl = response.data.redirect;
            router.visit(redirectUrl);
        })
        .catch(error => {
            console.error('Failed to set car session:', error);
        });
};
  const getStatusColor = (status) => {
    switch (status) {
      case "sale":
        return "bg-blue-500"
      case "rent":
        return "bg-green-500"
      case "rented":
        return "bg-amber-500"
         case "sold":
        return "bg-red-500"
      default:
        return "bg-primary"
    }
  }

  
    const handleDelete = (car) => {
      axios.post('/cars/session', { car_id: car.id })
      .then(() => {
          // بعدها احذف السيارة
          router.delete(route("cars.destroy"), {
              data: {
                  page: currentPage,  // للحفاظ على الصفحة الحالية
              },
              preserveState: true,
              preserveScroll: true,
          });
      })
      .catch((error) => {
          console.error("فشل في تخزين car_id في الجلسة:", error);
      });
    };
  const handleStatusChangeClick = (status) => {
    if (status === "sold") {
      setStatusToChangeTo("sold")
      setIsMarkAsSoldDialogOpen(true)
    } else {
      onStatusChange(car.id, status)
    }
  }

  const confirmStatusChange = () => {
    if (statusToChangeTo) {
      onStatusChange(car.id, statusToChangeTo)
      setIsMarkAsSoldDialogOpen(false)
      setStatusToChangeTo(null)
    }
  }

  const handleEdit = (carId) => {
    axios.post('/cars/session', { car_id: carId })
        .then(() => {
            router.visit(route("cars.edit"));
        })
        .catch((error) => {
            console.error("Failed to set car_id in session:", error);
        });
};

  const reviews = car.reviews || [];

  const latestReview = reviews
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .find((review) => review.comment && review.comment.trim() !== '');
  


      const firstImage = car.images.length > 0 ? car.images[0].image_path : 'default-image-path.jpg'; // Use a default image if no images exist.
  return (
    <>
      <Card className="overflow-hidden">
        <div className="cursor-pointer"  onClick={() => handleCardClick(car.id)}
            >
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <LazyLoadImage
              src={`storage/${firstImage}`}
              alt={`${car.year} ${car.brand} ${car.model}`}
              className="object-cover h-full w-full aspect-square"
              effect="blur" // Optional effect for lazy loading
            />
               <Badge className={`absolute top-2 right-2 xs-range:text-xs xs-s-range:text-xs ${getStatusColor(car.status)}`}>
                  {car.status === "rented" || car.status === "sold" ? car.status.charAt(0).toUpperCase() + car.status.slice(1) : `For ${car.status.charAt(0).toUpperCase() + car.status.slice(1)}`}
                </Badge>
                  {car.company.company_name && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white bg-opacity-90 rounded-full px-2 py-1">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden xs-range:w-3 xs-range:h-3 xs-s-range:w-3 xs-s-range:h-3">
                    <LazyLoadImage
                      src={`/storage/${car.company.logo_path}`}
                      alt={car.company.company_name}
                      className="object-cover"
                      effect="blur"
                      />
                    </div>
                  <span className="text-xs font-medium xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">{car.company.company_name}</span>
                   </div>
                  )}
            </div>
            </div>

        <CardContent className="p-4 xs">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                {car.brand} {car.model}
              </h3>
              <div className="flex items-center text-muted-foreground mt-1  xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                <Calendar className="h-4 w-4 mr-1 xs-range:h-2 xs-range:w-2 xs-s-range:h-2 xs-s-range:w-2" />
                <span>{car.year}</span>
              </div>
            </div>
            <div className="flex items-center font-bold text-lg">
            <span className="font-medium  xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                    {car.currency === "USD" 
                    ? new Intl.NumberFormat('en-US').format(car.price).replace(/,/g, '.') + " USD"  
                    : new Intl.NumberFormat('en-US').format(car.price).replace(/,/g, '.') + " SYP"}
                </span>
            </div>
          </div>

          {/* Rating section */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div className="flex mr-2 items-center gap-1">
            <RatingStars rating={car.rates || ""} size="sm" interactive={false} />
            <span className="text-sm font-medium xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                {car.rates}
              </span>
                </div>
              <span className="text-sm font-medium xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                  {car.reviews_count} {car.reviews_count === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>

          {/* Latest review preview */}
          {latestReview ? (
  <div className="mt-3 p-3 bg-muted rounded-md xs-range:rounded-sm">
    <div className="flex justify-between items-start">
      <p className="text-sm font-medium xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
        {latestReview.user.name}
      </p>
      <div className="flex xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
        <RatingStars rating={latestReview.rating} size="sm" interactive={false} />
      </div>
    </div>
    <p className="text-sm mt-1 line-clamp-2 xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
      {latestReview.comment}
    </p>

    <ReviewsDialog car={car} />
  </div>
        ) : reviews.length > 0 ? (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground text-center xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
              No reviews with comment yet
            </p>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground text-center xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
              No reviews yet
            </p>
          </div>
        )}

          
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button variant="outline" size="sm"  className = " xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]"
          onClick={() => handleEdit(car.id)}
          >
              <Edit className="h-4 w-4 mr-2" />
              Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>

              {car.status === "sell" && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChangeClick("sold")}>
                    <Tag className="h-4 w-4 mr-2" />
                    Mark as Sold
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(car.id,"rent")}>
                    <Tag className="h-4 w-4 mr-2" />
                    Change to For Rent
                  </DropdownMenuItem>
                </>
              )}


                {car.status === "rent" && (
                        <>
                    <DropdownMenuItem onClick={() => onStatusChange(car.id,"rented")}>
                        <Tag className="h-4 w-4 mr-2" />
                        Mark as Rented
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(car.id,"sell")}>
                        <Tag className="h-4 w-4 mr-2" />
                        Change to For Sell
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChangeClick("sold")}>
                        <Tag className="h-4 w-4 mr-2" />
                        Mark as Sold
                    </DropdownMenuItem>
                    </>
                )}

                  {car.status === "rented" && (
                        <>
                      <DropdownMenuItem onClick={() => handleStatusChangeClick("sold")}>
                        <Tag className="h-4 w-4 mr-2" />
                        Mark as Sold
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(car.id,"sell")}>
                        <Tag className="h-4 w-4 mr-2" />
                        Change to For Sell
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(car.id,"rent")}>
                        <Tag className="h-4 w-4 mr-2" />
                        Change to For Rent
                    </DropdownMenuItem>
                    </>
                )}

            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {car.make} {car.model} from your list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(car)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isMarkAsSoldDialogOpen} onOpenChange={setIsMarkAsSoldDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Sold?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this {car.brand} {car.model} as sold? This make these car dont shwo to any one you can deleted from you car list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

