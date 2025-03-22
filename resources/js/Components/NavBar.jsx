import { Link } from "@inertiajs/react"
import MainMenu from "./MainMenu"
import HamburgerMenu from "./HamburgerMenu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { Bus, Car, Package, SlidersHorizontal, Trash2, Truck } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "./ui/input"
import SearchBar from "./SearchBar"
import { useState } from "react"
import { Inertia } from "@inertiajs/inertia"
const NavBar = ({auth,status,hasVerifiedEmail}) => {

  const [selectedBodyTypes, setSelectedBodyTypes] = useState("")
  const [location, setLocation] = useState("uae")
  const [makeModel, setMakeModel] = useState("")
  const [yearFrom, setYearFrom] = useState("")
  const [yearTo, setYearTo] = useState("")
  const [keyword, setKeyword] = useState("")

  const toggleBodyType = (type) => {
    setSelectedBodyTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }
  const clearFilters = () => {
    setLocation("uae")
    setMakeModel("")
    setYearFrom("")
    setYearTo("")
    setKeyword("")
    setSelectedBodyTypes([])
  }
  const bodyTypes = [
    { id: "coupe", label: "Coupe", icon: <Car className="w-6 h-6" /> },
    { id: "sedan", label: "Sedan", icon: <Car className="w-6 h-6" /> },
    { id: "suv", label: "SUV", icon: <Car className="w-6 h-6" /> },
    { id: "hatch", label: "Hatch", icon: <Car className="w-6 h-6" /> },
    { id: "wagon", label: "Wagon", icon: <Car className="w-6 h-6" /> },
    { id: "pickup", label: "Pickup", icon: <Truck className="w-6 h-6" /> },
    { id: "minivan", label: "Minivan", icon: <Bus className="w-6 h-6" /> },
    { id: "commercial", label: "Commercial", icon: <Truck className="w-6 h-6" /> },
    { id: "other", label: "Other", icon: <Package className="w-6 h-6" /> },
  ]
  const handlelogoclick = () => {
    Inertia.visit(route("main"));
  }
  return (
    <>
        <header className="sticky top-0 z-50 w-full border-b bg-white xs-range:mb-2 shadow-lg">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link onClick={handlelogoclick} className="flex-shrink-0">
            <div className="font-bold text-2xl text-gray-800 xs-range:text-xl">
              <span className="text-blue-500">m</span>
              <span>otom</span>
              <span className="text-blue-500">.</span>
              <span>com</span>
            </div>
          </Link>

          {/* Filters Button and Search Bar */}
          <div className="flex items-center flex-1 max-w-xl mx-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-r-none border-r-0 bg-blue-400 text-white hover:bg-blue-400 hover:text-white">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[400px] sm:w-[540px] p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">SEARCHING</h2>
                      <Button variant="ghost" className="text-pink-500 hover:text-pink-600" onClick={clearFilters}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Filters Content */}
                  <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-6">
                      {/* Location */}
                      <div className="space-y-2">
                        <Select value={location} onValueChange={setLocation}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All United Arab Emirates" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uae">All United Arab Emirates</SelectItem>
                            <SelectItem value="dubai">Dubai</SelectItem>
                            <SelectItem value="abu-dhabi">Abu Dhabi</SelectItem>
                            <SelectItem value="sharjah">Sharjah</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Make/Model */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">Make / Model</label>
                        <Input
                          value={makeModel}
                          onChange={(e) => setMakeModel(e.target.value)}
                          placeholder="Add Make and Model"
                          className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                        />
                      </div>

                      {/* Year Range */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">Year</label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            value={yearFrom}
                            onChange={(e) => setYearFrom(e.target.value)}
                            placeholder="From"
                            type="number"
                            className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                          />
                          <Input
                            value={yearTo}
                            onChange={(e) => setYearTo(e.target.value)}
                            placeholder="To"
                            type="number"
                            className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                          />
                        </div>
                      </div>

                      {/* Keyword */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">Keyword</label>
                        <Input
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          placeholder="Keyword"
                          className="w-full focus:outline-none focus:ring-0 focus:border-inherit"
                        />
                      </div>

                      {/* Body Type */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">Body Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {bodyTypes.map((type) => (
                            <Button
                              key={type.id}
                              variant={selectedBodyTypes.includes(type.id) ? "default" : "outline"}
                              className={`flex flex-col items-center justify-center h-20 p-2 ${
                                selectedBodyTypes.includes(type.id) ? "bg-blue-500 text-white hover:bg-blue-600" : ""
                              }`}
                              onClick={() => toggleBodyType(type.id)}
                            >
                              {type.icon}
                              <span className="mt-1 text-xs">{type.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t p-4 mt-auto">
                    <div className="flex justify-between gap-4">
                      <Button
                        variant="ghost"
                        className="flex-1"
                        onClick={() => {
                          const sheet = document.querySelector('[data-state="open"]')
                          if (sheet) {
                            ;(sheet).click()
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white">0 results</Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="relative flex-1">
              <SearchBar />
            </div>
          </div>

          {/* Menu Button with Sheet (visible on larger screens) */}
          <MainMenu authuser = {auth} status = {status} hasVerifiedEmail = {hasVerifiedEmail} />
          
           
          {/* Hamburger Menu (visible on smaller screens) */}
          <HamburgerMenu  authuser = {auth} status = {status} hasVerifiedEmail = {hasVerifiedEmail}/>
        </div>
      </header>
    </>
  )
}

export default NavBar
