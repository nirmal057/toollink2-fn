import React from 'react';
import { Package, Truck, Calendar, CheckCircle } from 'lucide-react';

const DeliveryManagementDemo: React.FC = () => {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    🚛 Warehouse Delivery Management System - Demo
                </h1>
                <p className="text-gray-600 mb-6">
                    This system allows warehouse staff to manage sub-orders and create deliveries efficiently.
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Delivery Management Card */}
                    <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <Package className="h-8 w-8 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Delivery Management
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            View and manage warehouse sub-orders, create deliveries with driver assignment.
                        </p>
                        <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Filter sub-orders by status and category</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Assign drivers to deliveries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Set priority and delivery notes</span>
                            </div>
                        </div>
                        <a
                            href="/warehouse/delivery-management"
                            className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Open Delivery Management
                        </a>
                    </div>

                    {/* Calendar Card */}
                    <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <Calendar className="h-8 w-8 text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Delivery Calendar
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Visual calendar view of all scheduled deliveries with status tracking.
                        </p>
                        <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Monthly calendar view</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Color-coded status indicators</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Daily delivery statistics</span>
                            </div>
                        </div>
                        <a
                            href="/warehouse/delivery-calendar"
                            className="inline-block mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Open Delivery Calendar
                        </a>
                    </div>
                </div>

                {/* Status Legend */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Status Legend</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm">Pending - Awaiting assignment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm">Assigned - Driver assigned</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-sm">In Transit - On the way</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm">Delivered - Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm">Failed - Delivery failed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                <span className="text-sm">Cancelled - Cancelled</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Priority Legend */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Priority Indicators</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-3 bg-red-500"></div>
                                <span className="text-sm">Urgent - Immediate attention</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-3 bg-orange-500"></div>
                                <span className="text-sm">High - Priority delivery</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-3 bg-blue-500"></div>
                                <span className="text-sm">Normal - Standard delivery</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-3 bg-gray-500"></div>
                                <span className="text-sm">Low - Non-urgent</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Truck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-blue-600">Active Deliveries</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-green-600">Completed Today</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <Package className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-yellow-600">0</div>
                        <div className="text-sm text-yellow-600">Pending Orders</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-purple-600">Scheduled</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryManagementDemo;
