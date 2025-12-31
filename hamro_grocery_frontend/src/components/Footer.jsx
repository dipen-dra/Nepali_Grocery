import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';



const Footer = () => {
    const navigate = useNavigate();


    const handleNavigate = (path) => {
        if (path.startsWith('/#')) {
            const sectionId = path.substring(2);
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/');
            }
        } else {
            navigate(path);
        }
    };

    return (
        <footer id="footer" className="bg-white border-t border-gray-200">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">

                    {/* LOGO / MISSION */}
                    <div className="col-span-1 sm:col-span-2 md:col-span-1">
                        <img src="/NepGrocery.png" alt="NepGrocery Logo" className="h-10 w-auto mb-3" />
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Your daily dose of freshness, delivered right to your door with care and quality you can trust.
                        </p>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4 tracking-wide">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><button onClick={() => handleNavigate('/#hero-section')} className="text-gray-500 hover:text-green-600 transition-colors">Home</button></li>
                            <li><button onClick={() => handleNavigate('/#featured-products')} className="text-gray-500 hover:text-green-600 transition-colors">Products</button></li>
                            <li><button onClick={() => handleNavigate('/#why-choose-us')} className="text-gray-500 hover:text-green-600 transition-colors">About Us</button></li>
                        </ul>
                    </div>

                    {/* CONTACT INFO */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4 tracking-wide">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center">
                                <FaPhoneAlt className="text-green-600 mr-3" />
                                <a href="tel:9849423853" className="text-gray-500 hover:text-green-600 transition-colors">9849423853</a>
                            </li>
                            <li className="flex items-center">
                                <FaEnvelope className="text-green-600 mr-3" />
                                <a href="mailto:nepgrocery10@gmail.com" className="text-gray-500 hover:text-green-600 transition-colors">nepgrocery10@gmail.com</a>
                            </li>
                        </ul>
                    </div>

                    {/* NEWSLETTER */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4 tracking-wide">Stay Updated</h4>
                        <p className="text-gray-500 mb-4 text-sm">Subscribe for updates and exclusive offers.</p>
                        <form className="flex" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full rounded-l-md px-4 py-2 bg-gray-100 border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                aria-label="Email for newsletter"
                            />
                            <button type="submit" className="bg-green-600 px-4 rounded-r-md text-white font-semibold hover:bg-green-700 transition-colors text-sm">
                                Go
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-center">
                    <p className="text-gray-400 text-xs mb-4 sm:mb-0">
                        &copy; {new Date().getFullYear()} NepGrocery. All Rights Reserved.
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-600 transition-colors"><FaFacebookF size={20} /></a>
                        <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-pink-500 transition-colors"><FaInstagram size={20} /></a>
                        <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-sky-500 transition-colors"><FaTwitter size={20} /></a>
                        <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-blue-700 transition-colors"><FaLinkedinIn size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;