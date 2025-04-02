"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RatingStars from "./RatingStars"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { router, useForm } from "@inertiajs/react";
import { Dialog, DialogContent } from "./ui/dialog";
import { LogIn, SmilePlus } from "lucide-react";

export function UserRatingForm({ auth, onClose, CarBrand, CarModel, CarId, CompanyId, CompanyName }) {
  const [thanksDialogOpen, setThanksDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  // Determine which tab should be shown by default
  const defaultTab = CarId ? "car" : "dealer";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Use Inertia's useForm to manage form data
  const { data, setData, post, processing, reset } = useForm({
    car_id: CarId || null,
    company_id: CompanyId || null,
    rating: 0,
    comment: "",
  });

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [CarId, CompanyId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!auth.user) {
      setLoginDialogOpen(true)
    }
    else{
    post(route("reviews.store"), {
      onSuccess: () => {
        setThanksDialogOpen(true);
        reset();
        setTimeout(() => {
          onClose();
        }, 3000);
      },
    });
  }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4">
        <Tabs defaultValue={defaultTab} onValueChange={(tab) => {
          setActiveTab(tab);
          setData({
            car_id: tab === "car" ? CarId : null,
            company_id: tab === "dealer" ? CompanyId : null,
            rating: 0, // Reset rating when switching tabs
            comment: "",
          });
        }}>
          <TabsList className="grid grid-cols-2 mb-4">
            {CarId && <TabsTrigger value="car">Rate Car</TabsTrigger>}
            {CompanyId && <TabsTrigger value="dealer">Rate Company</TabsTrigger>}
          </TabsList>

          {CarId && (
            <TabsContent value="car" className="space-y-4">
              <div className="text-center">
                <p className="mb-2 font-medium">How would you rate this {CarBrand} {CarModel}?</p>
                <div className="flex justify-center mb-2">
                  <RatingStars rating={data.rating} size="lg" interactive onRatingChange={(value) => setData("rating", value)} />
                </div>
                <p className="text-sm text-gray-500">
                  {data.rating === 0 ? "Click to rate"
                    : data.rating === 1 ? "Poor"
                    : data.rating === 2 ? "Fair"
                    : data.rating === 3 ? "Good"
                    : data.rating === 4 ? "Very Good"
                    : "Excellent"}
                </p>
              </div>
            </TabsContent>
          )}

          {CompanyId && (
            <TabsContent value="dealer" className="space-y-4">
              <div className="text-center">
                <p className="mb-2 font-medium">How would you rate {CompanyName}?</p>
                <div className="flex justify-center mb-2">
                  <RatingStars rating={data.rating} size="lg" interactive onRatingChange={(value) => setData("rating", value)} />
                </div>
                <p className="text-sm text-gray-500">
                  {data.rating === 0 ? "Click to rate"
                    : data.rating === 1 ? "Poor"
                    : data.rating === 2 ? "Fair"
                    : data.rating === 3 ? "Good"
                    : data.rating === 4 ? "Very Good"
                    : "Excellent"}
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="mt-4">
          <label htmlFor="review" className="block mb-2 font-medium">
            Your Review (Optional)
          </label>
          <Textarea
            id="review"
            placeholder="Share your experience..."
            value={data.comment}
            onChange={(e) => setData("comment", e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={processing || data.rating === 0}>
            {processing ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </form>

      <Dialog open={thanksDialogOpen} onOpenChange={setThanksDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-rose-100 p-3 mb-4">
              <SmilePlus className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Thank You for Your Rating!</h2>
            <Button onClick={() => setThanksDialogOpen(false)}>Close</Button>
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
            <p className="text-center text-gray-500 mb-6">You need to login to Rate cars.</p>
            <p className="text-center text-gray-500 mb-6">Pleace Click on Menu Button</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
