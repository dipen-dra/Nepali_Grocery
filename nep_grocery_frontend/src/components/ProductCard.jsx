
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { CartContext } from '../context/CartContext'; // ✅ Use CartContext
import { FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext); // ✅ Access addToCart
    const navigate = useNavigate();

    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const handleIncrement = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        addToCart(product, quantity); // ✅ Actually add to cart

        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
            // Optionally navigate to cart or dashboard
            // navigate('/dashboard');
        }, 1500);
    };

    const isOutOfStock = product.stock === 0;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full transition-shadow duration-300 hover:shadow-lg relative overflow-hidden">
            <div 
                className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full text-white ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}
            >
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
            </div>

            <div className="w-full h-48">
                <img
                    src={product.imageUrl || '/images/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>
           
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow mb-4">
                    <h3 className="text-lg font-bold text-gray-800 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                        {product.stock > 0 ? `${product.stock} available` : 'Currently unavailable'}
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-black-600">₹{product.price.toFixed(2)}</p>

                    {!isOutOfStock && (
                        <div className="flex items-center border border-gray-300 rounded-md">
                            <button onClick={handleDecrement} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={quantity === 1}>
                                <FaMinus size={12} />
                            </button>
                            <span className="px-3 font-semibold text-gray-800">{quantity}</span>
                            <button onClick={handleIncrement} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={quantity === product.stock}>
                                <FaPlus size={12} />
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdded}
                    className={`mt-4 w-full flex justify-center items-center py-2.5 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                        isOutOfStock ? 'bg-gray-400 cursor-not-allowed' :
                        isAdded ? 'bg-blue-500' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {isAdded ? 'Added!' : isOutOfStock ? 'Out of Stock' : <FaShoppingCart size={18} />}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;