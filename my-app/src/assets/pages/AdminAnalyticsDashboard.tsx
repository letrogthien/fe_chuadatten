import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/transactionService';
import {
    getAnalyticsOverview,
    getRevenueChartData,
    getTopProducts
} from '../../services/transactionApi';

type AnalyticsOverviewDTO = components['schemas']['AnalyticsOverviewDTO'];
type TopProductDTO = components['schemas']['TopProductDTO'];

const AdminAnalyticsDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState<number>(30); // Default 30 days
    const [overview, setOverview] = useState<AnalyticsOverviewDTO | null>(null);
    const [topProducts, setTopProducts] = useState<TopProductDTO[]>([]);
    const [revenueData, setRevenueData] = useState<any>(null);

    // For demonstration, using a fixed seller ID. In real app, this should come from admin context
    const DEMO_SELLER_ID = 'admin-analytics';

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            
            // Load analytics data with proper error handling
            try {
                const overviewRes = await getAnalyticsOverview(DEMO_SELLER_ID, timeRange);
                setOverview(overviewRes);
            } catch (error) {
                console.error('Failed to load overview:', error);
            }

            try {
                const topProductsRes = await getTopProducts(DEMO_SELLER_ID, timeRange, 10);
                setTopProducts(topProductsRes || []);
            } catch (error) {
                console.error('Failed to load top products:', error);
            }

            try {
                const revenueRes = await getRevenueChartData(DEMO_SELLER_ID, timeRange.toString());
                setRevenueData(revenueRes);
            } catch (error) {
                console.error('Failed to load revenue data:', error);
            }

        } catch (error) {
            console.error('Failed to load analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        return new Intl.NumberFormat('en-US').format(num);
    };

    const formatPercentage = (num?: number) => {
        if (!num) return '0%';
        return `${num.toFixed(2)}%`;
    };

    const getGrowthColor = (growth?: number) => {
        if (!growth) return 'text-gray-500';
        return growth > 0 ? 'text-green-600' : 'text-red-600';
    };

    const getGrowthIcon = (growth?: number) => {
        if (!growth) return '→';
        return growth > 0 ? '↗' : '↘';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <label htmlFor="timeRange" className="text-sm font-medium text-gray-700">Time Range:</label>
                    <select
                        id="timeRange"
                        value={timeRange}
                        onChange={(e) => setTimeRange(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Overview Cards */}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(overview.totalRevenue)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <span className="text-2xl">💰</span>
                            </div>
                        </div>
                        {overview.monthlyGrowth?.revenue !== undefined && (
                            <div className={`flex items-center mt-4 text-sm ${getGrowthColor(overview.monthlyGrowth.revenue)}`}>
                                <span className="mr-1">{getGrowthIcon(overview.monthlyGrowth.revenue)}</span>
                                <span>{formatPercentage(Math.abs(overview.monthlyGrowth.revenue))} from last period</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(overview.totalOrders)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <span className="text-2xl">📦</span>
                            </div>
                        </div>
                        {overview.monthlyGrowth?.orders !== undefined && (
                            <div className={`flex items-center mt-4 text-sm ${getGrowthColor(overview.monthlyGrowth.orders)}`}>
                                <span className="mr-1">{getGrowthIcon(overview.monthlyGrowth.orders)}</span>
                                <span>{formatPercentage(Math.abs(overview.monthlyGrowth.orders))} from last period</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(overview.averageOrderValue)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <span className="text-2xl">💳</span>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            Per transaction
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">New Customers</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(overview.newCustomers)}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <span className="text-2xl">👥</span>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            Per transaction
                        </div>
                    </div>
                </div>
            )}

            {/* Order Status Distribution */}
            {overview && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {formatNumber(overview.completedOrders)}
                            </div>
                            <div className="text-sm text-green-600 font-medium">Completed</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">
                                {formatNumber(overview.pendingOrders)}
                            </div>
                            <div className="text-sm text-yellow-600 font-medium">Pending</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {formatNumber(overview.cancelledOrders)}
                            </div>
                            <div className="text-sm text-red-600 font-medium">Cancelled</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {formatPercentage(overview.deliverySuccessRate)}
                            </div>
                            <div className="text-sm text-blue-600 font-medium">Success Rate</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h3>
                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.slice(0, 5).map((product, index) => (
                                <div key={product.productId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-semibold text-sm">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {product.productName || `Product ${product.productId}`}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {product.productId}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-900">
                                            {formatNumber(product.totalSales)} sold
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatCurrency(product.totalRevenue)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No product data available
                        </div>
                    )}
                </div>

                {/* Performance Metrics */}
                {overview && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Average Rating</span>
                                <div className="flex items-center">
                                    <span className="text-lg font-semibold text-gray-900 mr-2">
                                        {overview.averageRating?.toFixed(1) || '0.0'}
                                    </span>
                                    <span className="text-yellow-500">⭐</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Response Rate</span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {formatPercentage(overview.responseRate)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Avg Processing Time</span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {overview.averageProcessingTime?.toFixed(1) || '0.0'} days
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Customer Retention</span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {overview.returningCustomers && overview.newCustomers ? 
                                        formatPercentage((overview.returningCustomers / (overview.returningCustomers + overview.newCustomers)) * 100)
                                        : '0%'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Revenue Chart Placeholder */}
            {revenueData && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">📊</div>
                            <div>Revenue chart data loaded</div>
                            <div className="text-sm mt-2">
                                Integration with charting library needed
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnalyticsDashboard;