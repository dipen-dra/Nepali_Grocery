import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext.jsx';
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 50;

    if (cartItems.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-lg shadow-sm">
                <ShoppingCart size={64} className="mx-auto text-gray-300" />
                <h2 className="mt-6 text-2xl font-semibold text-gray-800">Your cart is empty</h2>
                <Link to="/dashboard/shop" className="mt-6 inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h1 className="text-2xl font-semibold">Your Cart ({cartItems.length} items)</h1>
                    <button onClick={clearCart} className="text-red-500 hover:text-red-700 font-semibold text-sm flex items-center gap-1">
                        <Trash2 size={16}/> Clear Cart
                    </button>
                </div>
                <div className="divide-y">
                    {cartItems.map(item => (
                        <div key={item._id} className="flex items-center gap-4 py-4">
                            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md"/>
                            <div className="flex-grow">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-gray-500">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-100 rounded-full">
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-2 text-gray-600 hover:text-red-500"><Minus size={16}/></button>
                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-2 text-gray-600 hover:text-green-500"><Plus size={16}/></button>
                            </div>
                            <p className="font-semibold w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-600 p-2">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full lg:w-80 flex-shrink-0">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold border-b pb-4 mb-4">Order Summary</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Delivery Fee</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t pt-4 mt-2"><span>Total</span><span>₹{(totalAmount + deliveryFee).toFixed(2)}</span></div>
                    </div>
                    <Link to="/dashboard/checkout" className="mt-6 w-full bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700">
                        Proceed to Checkout <ArrowRight size={20}/>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CartPage;