import { useState, useEffect } from "react";
import { Mail, Phone } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
const ContactBanner = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);

        return () => {
            window.removeEventListener("resize", checkIfMobile);
        };
    }, []);
    return (
        <div className="relative w-full overflow-hidden rounded-lg bg-primary-hover text-white">
            {/* Logo */}
            <div className="absolute left-0 right-0 top-0 z-10 flex justify-end md:pr-8 pt-4 md:pt-6">
                <h1 className="text-xl md:text-4xl lg:text-5xl font-bold tracking-tighter mr-1">
                    <span>X</span>
                    <span>Motors</span>
                    <span>.</span>
                    <span>co</span>
                    <span className="relative inline-block -ml-0 animate-squish">
                        m
                    </span>
                </h1>
            </div>

            {/* Content Container */}
            <div className="flex md:flex-row items-center justify-between px-4 py-6 md:py-10 md:px-8 lg:px-12">
                {/* Left side - Text and Buttons */}
                <div className="z-10 w-full md:w-auto text-center md:text-left mb-4 md:mb-0">
                    <h2 className="text-sm md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 text-white">
                        Have any questions or comments?
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href="tel:+971505058090"
                            className="flex items-center justify-center gap-2 bg-white text-primary-hover hover:bg-gray-100 transition-colors py-2 px-4 rounded-md font-medium"
                        >
                            <Phone size={18} />
                            <span>+971505058090</span>
                        </a>

                        <a
                            href="mailto:info@sayartii.com"
                            className="flex items-center justify-center gap-2 bg-white text-primary-hover hover:bg-gray-100 transition-colors py-2 px-4 rounded-md font-medium"
                        >
                            <Mail size={18} />
                            <span>info@Xmotors.com</span>
                        </a>
                    </div>
                </div>

                {/* Right side - Car Image */}
                <div className="relative w-full md:w-auto mb-8">
                    <div className="w-full h-[200px] md:h-[200px] lg:h-[220px] relative">
                        <LazyLoadImage
                            src="images/911.png"
                            alt="Luxury sports car with gull-wing doors"
                            className="object-contain object-right-bottom"
                            priority
                            effect="blur"
                        />
                    </div>
                </div>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-2 right-8 md:-bottom-4 md:right-10">
                <div className="w-16 md:w-20 h-8 md:h-10 relative">
                    <div className="flex items-end">
                        <span className="text-white text-xs md:text-sm font-bold">
                            !!!
                            <span className="text-pink-600">Xmotors</span>
                            <span className="text-white">.com</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactBanner;
