import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../services/userServices.js';
import ProductCard from '../components/ProductCard.jsx';
import { Search, Loader2 } from 'lucide-react';

const INITIAL_VISIBLE_COUNT = 8;

const ProductsPage = ({ selectedCategory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const { data: products, isLoading, isError } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
    
    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    }, [selectedCategory]);

    const filteredProducts = products
        ?.filter(p => selectedCategory === 'all' || p.category?._id === selectedCategory)
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleLoadMore = () => setVisibleCount(prev => prev + INITIAL_VISIBLE_COUNT);
    const handleShowLess = () => setVisibleCount(INITIAL_VISIBLE_COUNT);

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 size={48} className="animate-spin text-green-600" /></div>;
    if (isError) return <div className="text-center text-red-500 p-8 bg-white rounded-lg">Failed to load products.</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex justify-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search this category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500" />
                </div>
            </div>
            
            {filteredProducts && filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold">No Products Found</h2>
                    <p className="text-gray-500 mt-2">Try adjusting your search or selecting a different category.</p>
                </div>
            ) : (
                 <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.slice(0, visibleCount).map(product => <ProductCard key={product._id} product={product} />)}
                    </div>
                    <div className="text-center mt-8 flex justify-center items-center gap-4">
                        {visibleCount > INITIAL_VISIBLE_COUNT && <button onClick={handleShowLess} className="bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-full hover:bg-gray-300">Show Less</button>}
                        {filteredProducts.length > visibleCount && <button onClick={handleLoadMore} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700">Load More</button>}
                    </div>
                 </>
            )}
        </div>
    );
};

export default ProductsPage;