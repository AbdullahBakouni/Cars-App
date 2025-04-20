
import CompanyCard from '@/Components/CompanyCard';
import { Button } from '@/Components/ui/button'
import { Head, router, usePage } from '@inertiajs/react'
import { CheckCircle2, Car, CheckCircle, MapPin } from 'lucide-react'
import React, { lazy, Suspense, useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
const NavBar = lazy(() => import("@/Components/NavBar"));
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
import { Inertia } from '@inertiajs/inertia';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/Components/ui/label';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { LazyLoadImage } from "react-lazy-load-image-component"
import 'react-lazy-load-image-component/src/effects/blur.css';
const UserCompanies = ({auth,company,hasVerifiedEmail}) => {
     const { resetpassstatus } = usePage().props;
    const { currency } = usePage().props;
    // const currentPage = company.current_page;
    const [currentPageState, setCurrentPageState] = useState(company?.current_page ?? 1);
    const totalPages = company.last_page;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [message, setMessage] = useState('');
    const { success } = usePage().props;
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [dialogOpen, setDialogOpen] = useState(false)
console.log(company)
    useEffect(() => {
      if (company?.current_page) {
        setCurrentPageState(company.current_page);
      }
    }, [company]);
    const handleCompanySelect = (companyId) => {
      setSelectedCompany(companyId)
    }

    const handleContinue = () => {
      if (selectedCompany) {
        // يتم تحديد الشركة المختارة
        const chosenCompany = company.data.find((item) => item.id === selectedCompany);
    
        // إرسال البيانات عبر الـ Inertia لتخزينها في الجلسة
        Inertia.post(route('setCompanySession'), {
          company_id: chosenCompany.id,
          company_name: chosenCompany.company_name,
          company_logo: chosenCompany.logo_path,
          company_location: chosenCompany.location,
        }, {
          onSuccess: () => {
            Inertia.visit(route('car.create'))
          }
        });        
      }
    };
    
    
  
    const resetSelection = () => {
      setSelectedCompany(null)
    }
     useEffect(() => {
        const storedMessage = sessionStorage.getItem('successMessage');
        if (storedMessage) {
          setMessage(storedMessage);
          setIsDialogOpen(true);
        } else if (success) {
          sessionStorage.setItem('successMessage', success);
          setMessage(success);
          setIsDialogOpen(true);
        }
      }, [success]);
      
      const renderPaginationItems = () => {
        const items = [];
        
        // Always show first page
        items.push(
          <PaginationItem key="first">
            <PaginationLink
              onClick={() => handlePageChange(1)}
              isActive={currentPageState === 1}
              className="cursor-pointer"
            >
              1
            </PaginationLink>
          </PaginationItem>,
        );
        
        // Show ellipsis if needed
        if (currentPageState > 3) {
          items.push(
            <PaginationItem key="ellipsis-1">
              <PaginationEllipsis />
            </PaginationItem>,
          );
        }
        
        // Show current page and surrounding pages
        for (let i = Math.max(2, currentPageState - 1); i <= Math.min(totalPages - 1, currentPageState + 1); i++) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i)}
                isActive={currentPageState === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>,
          );
        }
        
        // Show ellipsis if needed
        if (currentPageState < totalPages - 2) {
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
                isActive={currentPageState === totalPages}
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
        router.get(route("company.my"), { 
          page
        }, {
          preserveState: true,  // Preserve the state (sorting, pagination)
          preserveScroll: true  // Preserve scroll position
        });
        setCurrentPageState(page);
      };
    return (
        <>
         <Head title={company.data.length > 0 ? `My Company (${company.data.length})` : "No company"} />
            <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <Suspense fallback={<div>Loading...</div>}>
                    <NavBar
                      auth={auth ? auth : ""}  // Ensure it's a string, or provide a default value
                      hasVerifiedEmail={hasVerifiedEmail || false}  // Ensure it's a boolean
                      currency={currency || "SYP"}  // Ensure it's a string
                      resetpassstatus={resetpassstatus || ""}  // Ensure it's a string
                    />
                      </Suspense>
                <div className="container mx-auto px-4 py-8">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold xs-range:text-sm xs-s-range:text-sm">My Companies</h1>
                    <Dialog
                  open={dialogOpen}
                  onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetSelection()
                  }}
                >
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)} className = "text-white">
              <Car className="h-4 w-4 mr-2" />
              Add New Car
            </Button>
          </DialogTrigger>

          {/* Company Selection Dialog */}
          <DialogContent className="sm:max-w-[500px] xs-range:max-w-[400px] xs-s-range:max-w-[400px]:">
            <DialogHeader>
              <DialogTitle>Select a Company</DialogTitle>
              <DialogDescription>Choose which company you want to add a new car to.</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <RadioGroup value={selectedCompany} onValueChange={handleCompanySelect}>
              <ScrollArea className="max-h-[300px] pr-3">
                <div className="space-y-3">
                <div className="space-y-3">
                    {company.data.map((company) => {
                      const isVerifiedCompany =
                        company?.rates >= 4.7 &&
                        company?.cars_count > 20 &&
                        (() => {
                          const createdDate = new Date(company?.created_at);
                          const now = new Date();
                          const diffInMonths =
                            (now.getFullYear() - createdDate.getFullYear()) * 12 +
                            (now.getMonth() - createdDate.getMonth());
                          return diffInMonths >= 7;
                        })();

                      return (
                        <div
                          key={company.id}
                          className={`border rounded-lg p-3 transition-colors ${
                            selectedCompany === company.id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <RadioGroupItem
                            value={company.id}
                            id={`company-${company.id}`}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`company-${company.id}`}
                            className="flex items-center cursor-pointer"
                          >
                            <div className="relative w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                              <LazyLoadImage
                                src={`storage/${company.logo_path}`}
                                alt={`${company.company_name}`}
                                className="object-cover"
                                effect="blur"
                              />
                              {isVerifiedCompany && (
                                <div className="absolute -bottom-1 -right-1">
                                  <CheckCircle className="h-4 w-4 text-primary fill-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <span className="font-medium">{company.company_name}</span>
                                {isVerifiedCompany && (
                                  <span className="ml-1 text-xs text-green-600 font-medium">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="text-xs">{company.location}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {company.cars_count} cars
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>

                  
                </div>
                </ScrollArea>
              </RadioGroup>
             
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleContinue} disabled={!selectedCompany} className = "text-white">
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
                  </div>
          
                  <div className="grid gap-8">
                  {company.data.map((company) => {
                    const isVerifiedCompany =
                      company?.rates >= 4.7 &&
                      company?.cars_count > 20 &&
                      (() => {
                        const createdDate = new Date(company?.created_at);
                        const now = new Date();
                        const diffInMonths =
                          (now.getFullYear() - createdDate.getFullYear()) * 12 +
                          (now.getMonth() - createdDate.getMonth());
                        return diffInMonths >= 7;
                      })();

                    return (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        currentPage={currentPageState}
                        isVerified={isVerifiedCompany}
                      />
                    );
                  })}
                  </div> 

                  {company.data.length === 0 && (
                                <div className="text-center py-10">
                                  <p className="text-muted-foreground">You don't have any companies yet. Add your first company!</p>
                                </div>
                            )}
          
          {totalPages > 1 && (
  <div className="flex justify-center mt-8">
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(Math.max(1, currentPageState - 1))}
            className={currentPageState === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {renderPaginationItems()}
        
        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(Math.min(totalPages, currentPageState + 1))}
            className={currentPageState === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}

                     <AlertDialog open={isDialogOpen && success !== null} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Status Changed Successfully
            </AlertDialogTitle>
            <AlertDialogDescription>
              {success}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className = "text-white">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
        </div>
        </>
      )
}

export default UserCompanies
