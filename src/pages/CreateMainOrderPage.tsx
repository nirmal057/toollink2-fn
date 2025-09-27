import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainOrderForm from '../components/MainOrderForm';
import { useAuth } from '../hooks/useAuth';

const CreateMainOrderPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleOrderCreated = (mainOrder: any, subOrders: any[]) => {
        console.log('Main Order Created:', mainOrder);
        console.log('Sub Orders Created:', subOrders);

        // Show success message and redirect
        setTimeout(() => {
            if (user?.role === 'customer') {
                navigate('/dashboard');
            } else {
                navigate('/orders');
            }
        }, 2000);
    };

    const handleClose = () => {
        navigate(-1); // Go back to previous page
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Please log in to create orders</h2>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Create New Order
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Create a new order that will be automatically split by material category and warehouse for optimized delivery.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <MainOrderForm
                    user={user}
                    onOrderCreated={handleOrderCreated}
                    onClose={handleClose}
                />
            </div>
        </div>
    );
};

export default CreateMainOrderPage;
