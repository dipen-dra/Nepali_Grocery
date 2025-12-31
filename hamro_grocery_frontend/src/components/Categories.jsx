import React from 'react';
const NavigationContext = React.createContext();

const Categories = () => {
    const categories = [
      {
        name: 'Fresh Vegetables',
        image: 'https://domf5oio6qrcr.cloudfront.net/medialibrary/11499/3b360279-8b43-40f3-9b11-604749128187.jpg'
      },
      {
        name: 'Seasonal Fruits',
        image: 'https://vaya.in/wp-content/uploads/2021/04/10-Seasonal-Fruits-and-Vegetables-You-Can-Include-in-Your-Diet.jpg'
      },
      {
        name: 'Dairy & Eggs',
        image: 'https://whisk.com/wp-content/uploads/2023/02/shutterstock_1679020255.jpg'
      },
      {
        name: 'Bakery & Breads',
        image: 'https://images.squarespace-cdn.com/content/v1/615b9d0d43b58041892c2244/c0c71b44-29df-4442-9ea5-09a1528d6e43/GrandCentralBakery_Cafe_CH_1x.jpg'
      },
    ];

    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Shop by Category</h2>
            <p className="text-lg text-gray-600 mt-2">Find exactly what you're looking for.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <a href="#" key={category.name} className="relative rounded-lg overflow-hidden shadow-lg group h-64">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold text-center p-4">{category.name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
};

export default Categories;
export { NavigationContext, Categories };