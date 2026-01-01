// import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { fetchUserOrders } from '../services/userServices.js';
// import { Loader2, Package } from 'lucide-react';

// const getStatusColor = (status) => {
//     switch (status) {
//         case 'Delivered': return 'bg-green-100 text-green-800';
//         case 'Shipped': return 'bg-blue-100 text-blue-800';
//         case 'Pending': return 'bg-yellow-100 text-yellow-800';
//         case 'Cancelled': return 'bg-red-100 text-red-800';
//         default: return 'bg-gray-100 text-gray-800';
//     }
// };

// const OrdersPage = () => {
//     const { data, isLoading, isError } = useQuery({ queryKey: ['userOrders'], queryFn: fetchUserOrders });

//     if (isLoading) return <div className="flex justify-center p-12"><Loader2 size={48} className="animate-spin text-green-600" /></div>;
//     if (isError) return <div className="text-center text-red-500 p-8 bg-white rounded-lg">Failed to load your orders.</div>;

//     return (
//         <div className="bg-white p-6 rounded-lg shadow-sm">
//             <h1 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">My Orders</h1>
//             <div className="space-y-4">
//                 {data?.orders?.length === 0 ? (
//                     <div className="text-center py-12">
//                         <Package size={64} className="mx-auto text-gray-300" />
//                         <h2 className="mt-4 text-xl font-semibold">You have no past orders.</h2>
//                     </div>
//                 ) : (
//                     data?.orders?.map(order => (
//                         <div key={order._id} className="border rounded-lg p-4 transition hover:shadow-md">
//                             <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
//                                 <div>
//                                     <p className="font-bold text-gray-800">Order ID: #{order._id.slice(-8)}</p>
//                                     <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
//                                 </div>
//                                 <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
//                                     {order.status}
//                                 </span>
//                             </div>
//                             <div className="my-3 border-t pt-3">
//                                 <p className="text-sm font-semibold mb-2">Items:</p>
//                                 <ul className="list-disc list-inside text-sm text-gray-600">
//                                     {order.items.map(item => (
//                                         <li key={item.product}>
//                                             {item.name} (x{item.quantity})
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                             <div className="border-t pt-2 mt-2 text-right">
//                                 <p className="font-semibold text-lg text-gray-800">Total: ₹{order.amount.toFixed(2)}</p>
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// };

// export default OrdersPage;