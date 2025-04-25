import { emitter } from "@/Pages/utils/event";
import { Link } from "@inertiajs/react";
import { Mail, Phone } from "lucide-react";

const Footer = () => {
    const handleClick = () => {
        emitter.emit("openSheet");
    };
    return (
        <footer className="bg-white py-8 md:py-12 border-t border-gray-200">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="md:col-span-1 lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="mr-2">
                                <div className="w-8 h-8 relative">
                                    <span className="text-primary-hover text-2xl font-bold">
                                        !!!
                                    </span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold">
                                <span className="text-primary">X</span>
                                <span>Motors</span>
                                <span className="text-primary">.</span>
                                <span>co</span>
                                <span className="relative inline-block -ml-0 animate-squish">
                                    m
                                </span>
                            </h2>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">
                            The Future of Car Listings in Syria.
                        </p>
                        <p className="text-sm text-gray-600 mb-6">
                            Xmotors: Your free, fast, and seamless car
                            classifieds platform—connecting buyers and renters
                            across the country in seconds.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex space-x-4">
                            <Link
                                href="#"
                                className="text--600 hover:text-gray-800 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                </svg>
                            </Link>
                            <Link
                                href="#"
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/aboutus"
                                    className="text-gray-600 hover:text-primary-hover transition-colors"
                                >
                                    About us
                                </Link>
                            </li>
                            <li>
                                <div
                                    className="cursor-pointer 
                                    text-gray-600
                                    hover:text-primary-hover transition-colors"
                                    onClick={handleClick}
                                >
                                    Log in
                                </div>
                            </li>
                            <li>
                                <div
                                    className="cursor-pointer 
                                    text-gray-600
                                    hover:text-primary-hover transition-colors"
                                    onClick={handleClick}
                                >
                                    Sign up
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/notice"
                                    className="text-gray-600 hover:text-primary-hover transition-colors"
                                >
                                    Important Notice
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold mb-4">
                            Contact us
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-gray-600 mb-1">Email</p>
                                <a
                                    href="mailto:info@sayartii.com"
                                    className="flex items-center text-gray-700 hover:text-primary-hover transition-colors"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    info@Xmotors.com
                                </a>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">Whatsapp</p>
                                <a
                                    href="tel:+971505058090"
                                    className="flex items-center text-gray-700 hover:text-primary-hover transition-colors"
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    +971-505058090
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        Copyright © Xmotors 2025. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
