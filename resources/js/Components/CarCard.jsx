

import { lazy, Suspense,useState } from "react"
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
import { Link } from "@inertiajs/react"
import RatingStars from "./RatingStars"
import { LazyLoadImage } from "react-lazy-load-image-component"
import 'react-lazy-load-image-component/src/effects/blur.css';
import ReviewsDialog from "./ReviewsDialog"
export function CarCard({ car, onDelete, onStatusChange}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMarkAsSoldDialogOpen, setIsMarkAsSoldDialogOpen] = useState(false)
  const [statusToChangeTo, setStatusToChangeTo] = useState(null)
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

  

  const latestReview =
    car.reviews.length > 0
      ? [...car.reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null
      const firstImage = car.images.length > 0 ? car.images[0].image_path : 'default-image-path.jpg'; // Use a default image if no images exist.
  return (
    <>
      <Card className="overflow-hidden">
      <Link href={`/car/${car.id}`} key={car.id}>
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
            </div>
            </Link>

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
            <div className="flex items-center">
              <div className="flex mr-2">
            <RatingStars rating={car.rates || ""} size="sm" interactive={false} />
                </div>
              <span className="text-sm font-medium xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
                {car.rates}  {car.reviews_count} {car.reviews_count === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>

          {/* Latest review preview */}
          {latestReview && (
            <div className="mt-3 p-3 bg-muted rounded-md xs-range:rounded-sm">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">{latestReview.user.name}</p>
                <div className="flex  xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]"><RatingStars rating={latestReview.rating} size="sm" interactive={false}/></div>
              </div>
              <p className="text-sm mt-1 line-clamp-2  xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">{latestReview.comment}</p>

              {/* View all reviews button */}
              <ReviewsDialog car={car} />
            </div>
          )}

          {/* No reviews message */}
          {car.reviews.length === 0 && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground text-center xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">No reviews yet</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button variant="outline" size="sm" asChild className = " xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
          <Link href={`/car/${car.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
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
              onClick={() => onDelete(car.id)}
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

