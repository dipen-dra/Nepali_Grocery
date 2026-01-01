import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import dayjs from 'dayjs';
import { Loader2, AlertTriangle, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';

const fetchPaymentHistory = async () => {
    const { data } = await api.get('/orders/payment-history');
    return data.history;
};


const getStatusChip = (paymentItem) => {

    if (paymentItem.status === 'Cancelled' && paymentItem.transactionId) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                <CheckCircle2 size={14} />
                Successful
            </span>
        );
    }


    if (paymentItem.status === 'Cancelled') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                <XCircle size={14} />
                Failed/Cancelled
            </span>
        );
    }


    if (paymentItem.paymentMethod === 'COD' && paymentItem.status === 'Delivered') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                <CheckCircle2 size={14} />
                Successful
            </span>
        );
    }


    if (paymentItem.transactionId) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                <CheckCircle2 size={14} />
                Successful
            </span>
        );
    }


    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <Clock size={14} />
            Incomplete
        </span>
    );
};

export const PaymentHistoryPage = () => {
    const queryClient = useQueryClient();
    const { data: history, isLoading, isError, error } = useQuery({
        queryKey: ['paymentHistory'],
        queryFn: fetchPaymentHistory,
    });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }, [queryClient]);

    if (isLoading) {
        return <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin text-green-600" size={32} /></div>;
    }

    if (isError) {
        return <div className="flex flex-col items-center justify-center py-12 text-red-600 bg-red-50 rounded-lg">
            <AlertTriangle size={32} />
            <p className="mt-2 font-semibold">Error: {error.response?.data?.message || error.message}</p>
        </div>;
    }

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">Payment History</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {history && history.length > 0 ? (
                                history.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 text-sm text-gray-600">{dayjs(item.createdAt).format('MMM D, YYYY')}</td>
                                        <td className="px-4 py-4 text-sm text-gray-500 font-mono">{item.transactionId || 'N/A'}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{item.paymentMethod}</td>
                                        <td className="px-4 py-4 text-center">{getStatusChip(item)}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-gray-800 text-right">₹{item.amount.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                        <CreditCard className="mx-auto mb-2 text-gray-400" size={32} />
                                        No payment records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};