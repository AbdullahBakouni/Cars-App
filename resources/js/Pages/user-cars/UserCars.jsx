import { CarCard } from '@/Components/CarCard';
import NavBar from '@/Components/NavBar';
import { Button } from '@/Components/ui/button';
import { Inertia } from '@inertiajs/inertia';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const UserCars = ({auth,cars,hasVerifiedEmail}) => {
   const { currency } = usePage().props;
   const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState(''); 
  const { success } = usePage().props;
  const { resetpassstatus } = usePage().props;
  // Show success dialog if there's a success message
  useEffect(() => {
    const storedMessage = sessionStorage.getItem('successMessage');
    if (storedMessage) {
      setMessage(storedMessage);  // Set message if it exists in sessionStorage
      setIsDialogOpen(true);  // Show the dialog
    } else if (success) {
      sessionStorage.setItem('successMessage', success);  // Store the success message in sessionStorage
      setMessage(success);  // Set the message from props
      setIsDialogOpen(true);  // Show the dialog
    }
  }, [success]);
  const handleCloseDialog = () => {
    setIsDialogOpen(false);  // Close dialog
    sessionStorage.removeItem('successMessage');  // Clear the message from sessionStorage
  };
  // Show success dialog if there's a success message
   const handleDelete = (id) => {
    Inertia.delete(route("cars.destroy", { car: id }));
  }

  const handleStatusChange = (id , newStatus) => {
      // Update car status using Get request
      Inertia.get(route("cars.my"), { car_id : id , status: newStatus });
  };
  const handleSellCarClick = () => {
    if (auth?.user && hasVerifiedEmail) {
      Inertia.visit(route('createcar'));
    } else {
      alert("Sorry You need to login");
    }
  };
  return (
    <>
    
    <Head title={cars.length > 0 ? `My Cars (${cars.length})` : "No Cars"} />
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
         <NavBar auth={auth} hasVerifiedEmail ={hasVerifiedEmail} currency = {currency} resetpassstatus={resetpassstatus}/>
          <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-6 xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">My Cars</h1>
        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold ml-3 xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]">Your Cars ({cars.length})</h2>
        <Button className = "mr-3 xs-range:text-[9px] xs-range:leading-[8px] xs-s-range:text-[9px] xs-s-range:leading-[8px]"
           onClick={handleSellCarClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Car
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {cars.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">You don't have any cars yet. Add your first car!</p>
        </div>
      )}
    </div>
     {/* AlertDialog for success message */}
     <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              </AlertDialogTitle>
              <AlertDialogDescription>
                <strong>Success!</strong> {message}
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction onClick={handleCloseDialog}>
                OK
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
  </div>
  </div>
  </>
  )
}

export default UserCars
