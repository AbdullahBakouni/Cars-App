import { useState, useEffect } from "react"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function ShareButton() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const shareOptions = [
    { 
      name: "WhatsApp", 
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`) 
    },
    { 
      name: "Facebook", 
      action: () => window.open(`https://m.me/username?text=${encodeURIComponent(shareUrl)}`)  // Replace 'username' with the Messenger handle
    },
    { 
      name: "Twitter", 
      action: () => window.open(`https://twitter.com/messages/compose?recipient_id=username`)  // Replace 'username' with the Twitter user ID
    },
    { 
      name: "Instagram", 
      action: () => window.open(`https://www.instagram.com/direct/new/`)  // Opens Instagram direct message page
    },
    { 
      name: "Email", 
      action: () => window.open(`mailto:?body=${encodeURIComponent(shareUrl)}`) 
    },
    { 
      name: "Copy Link", 
      action: () => {
        if (navigator.clipboard) {
          // Check if the Clipboard API is available
          navigator.clipboard.writeText(shareUrl).then(
            () => {
              alert("Link copied to clipboard!")
            },
            (err) => {
              console.error("Error copying to clipboard: ", err)
              alert("Failed to copy the link. Please try again.")
            }
          )
        } else {
          // Fallback to the old method if the Clipboard API is unavailable
          const textArea = document.createElement("textarea")
          textArea.value = shareUrl
          document.body.appendChild(textArea)
          textArea.select()
          try {
            const successful = document.execCommand("copy")
            if (successful) {
              alert("Link copied to clipboard!")
            } else {
              alert("Failed to copy the link. Please try again.")
            }
          } catch (err) {
            console.error("Fallback method failed: ", err)
            alert("Failed to copy the link. Please try again.")
          }
          document.body.removeChild(textArea)
        }
      }
    },
  ]

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button className="rounded-full px-6 shadow-lg">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="center">
          <div className="grid gap-1">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="ghost"
                className="justify-start px-4 py-2 h-10"
                onClick={option.action}
              >
                {option.name}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
