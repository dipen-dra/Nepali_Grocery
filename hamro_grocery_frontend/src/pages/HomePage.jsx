import React from 'react';
import HeroSection from '../components/HeroSection';
import WhyChooseUs from '../components/WhyChooseUs';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import CallToActionSection from '../components/CallToActionSection';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <>
      <div id="hero-section">
        <HeroSection />
      </div>
      <div id="why-choose-us">
        <WhyChooseUs />
      </div>
      <div id="categories">
        <Categories />
      </div>
      <div id="featured-products">
        <FeaturedProducts />
      </div>
      <div id="call-to-action">
        <CallToActionSection />
      </div>
      <div id="footer">
        <Footer />
      </div>
    </>
  );
};

export default HomePage;