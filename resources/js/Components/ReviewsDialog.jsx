import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import RatingStars from '@/Components/RatingStars'
import { Separator } from '@/components/ui/separator'
import axios from 'axios'

function ReviewsDialog({ car }) {
  const [reviews, setReviews] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadReviews = async (page = 1) => {
    const res = await axios.get(route('cars.reviews.paginated', car.id), { params: { page } })
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
  }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs  xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">
          View all reviews
          <ChevronRight className="h-2 w-2 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md xs-range:max-w-xs xs-s-range:max-w-xs">
        <DialogHeader>
          <DialogTitle>Reviews for {car.brand} {car.model}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            {reviews.map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{review.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <RatingStars rating={review.rating} size="sm" interactive={false} />
                </div>
                <p>{review.comment}</p>
                <Separator />
              </div>
            ))}

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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewsDialog
