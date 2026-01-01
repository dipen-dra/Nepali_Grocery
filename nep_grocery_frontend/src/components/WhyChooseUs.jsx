import React from 'react';

const NavigationContext = React.createContext();

const WhyChooseUs = () => {
    const features = [
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0-8.49-15.51"></path><path d="M12 2v20"></path><path d="M12 2a10 10 0 1 0 8.49 15.51"></path><path d="M22 12H2"></path></svg>, title: 'Locally Sourced', description: 'Supporting local farmers for ultimate freshness and quality.'},
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>, title: 'Quality Guaranteed', description: 'Every item is hand-picked and checked for quality assurance.'},
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="18" rx="2"></rect><line x1="1" y1="7" x2="23" y2="7"></line><line x1="8" y1="12" x2="8" y2="12"></line><line x1="12" y1="12" x2="12" y2="12"></line><line x1="16" y1="12" x2="16" y2="12"></line></svg>, title: 'Secure Payments', description: 'Your transactions are safe with our encrypted payment gateway.'},
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 18L12 22L16 18"></path><path d="M12 2L12 22"></path><path d="M16 6L12 2L8 6"></path></svg>, title: 'Fast Delivery', description: 'Get your groceries delivered to your doorstep in no time.'},
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Why Shop With Us?</h2>
                    <p className="text-lg text-gray-600 mt-2">We provide an experience you can trust.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-lg shadow-sm transform transition duration-300 hover:shadow-lg hover:scale-105 hover:ring-2 hover:ring-green-500 cursor-pointer"
                        >
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
export { NavigationContext, WhyChooseUs };