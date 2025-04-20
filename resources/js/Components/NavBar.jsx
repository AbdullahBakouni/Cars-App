import { Link } from "@inertiajs/react"
import MainMenu from "./MainMenu"
import HamburgerMenu from "./HamburgerMenu"
import SearchBar from "./SearchBar"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import FilterButton from "./FilterButton"
const NavBar = ({auth,status,hasVerifiedEmail,currency,resetpassstatus,filters}) => {

  return (
    <>
        <header className="sticky top-0 z-50 w-full border-b bg-white xs-range:mb-2 shadow-lg">
        <div className="container flex h-16 items-center justify-between gap-3 px-4">
          {/* Logo */}
          <div className="flex-shrink-0 mt-1">
          <Link href="/">
            <LazyLoadImage
            src="/images/logo.png"
            alt={"Xmotors"}
            className="xs-range:w-9 xs-range:h-9 w-[50px] h-[50px]"
            effect="blur" // Optional effect for lazy loading
            />
          </Link>
          </div>
          {/* Filters Button and Search Bar */}
          <div className="flex items-center flex-1 max-w-xl mx-4">
           <FilterButton filters = {filters} />

            <div className="relative flex-1">
              <SearchBar />
            </div>
          </div>

          {/* Menu Button with Sheet (visible on larger screens) */}
          <MainMenu authuser = {auth} status = {status} hasVerifiedEmail = {hasVerifiedEmail} currency = {currency} resetpassstatus = {resetpassstatus}/>
          
           
          {/* Hamburger Menu (visible on smaller screens) */}
          <HamburgerMenu  authuser = {auth} status = {status} hasVerifiedEmail = {hasVerifiedEmail}  currency = {currency} resetpassstatus = {resetpassstatus}/>
        </div>
      </header>
    </>
  )
}

export default NavBar
