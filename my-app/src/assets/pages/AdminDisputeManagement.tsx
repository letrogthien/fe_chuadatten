import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/transactionService';
import { adminResolveDispute, getAllDisputes } from '../../services/transactionApi';

type OrderDisputeDto = components['schemas']['OrderDisputeDto'];

const AdminDisputeManagement: React.FC = () => {
    const [disputes, setDisputes] = useState<OrderDisputeDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 10
    });
    const [filters, setFilters] = useState({
        status: '' as string,
        issueType: ''
    });
    const [selectedDispute, setSelectedDispute] = useState<OrderDisputeDto | null>(null);
    const [resolveModal, setResolveModal] = useState(false);
    const [resolveData, setResolveData] = useState({
        status: 'COMPLETED' as string,
        autoRefund: false
    });

    useEffect(() => {
        loadDisputes();
    }, [pagination.currentPage, filters]);

    const loadDisputes = async () => {
        try {
            setLoading(true);
            const response = await getAllDisputes({
                status: filters.status || undefined,
                issueType: filters.issueType || undefined,
                page: pagination.currentPage,
                limit: pagination.pageSize
            });

            setDisputes(response.disputes || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.totalPages,
                totalElements: response.totalElements
            }));
        } catch (error) {
            console.error('Failed to load disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveDispute = async () => {
        if (!selectedDispute) return;

        try {
            setLoading(true);
            await adminResolveDispute(
                selectedDispute.id!,
                resolveData.status,
                resolveData.autoRefund
            );
            
            setResolveModal(false);
            setSelectedDispute(null);
            loadDisputes();
        } catch (error) {
            console.error('Failed to resolve dispute:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status?: string) => {
        const statusColors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'PROCESSING': 'bg-blue-100 text-blue-800'
        };
        return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Loading disputes...
                    </td>
                </tr>
            );
        }

        if (disputes.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No disputes found
                    </td>
                </tr>
            );
        }

        return disputes.map((dispute) => (
            <tr key={dispute.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            ID: {dispute.id}
                        </div>
                        <div className="text-sm text-gray-500">
                            Issue: {dispute.issueType}
                        </div>
                        <div className="text-sm text-gray-500">
                            Created: {formatDate(dispute.createdAt)}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            Order: {dispute.orderId}
                        </div>
                        <div className="text-sm text-gray-500">
                            Opened by: {dispute.openedBy}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                        {dispute.description || 'No description'}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(dispute.status)}`}>
                        {dispute.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                        onClick={() => {
                            setSelectedDispute(dispute);
                            setResolveModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        disabled={dispute.status === 'COMPLETED' || dispute.status === 'CANCELLED'}
                    >
                        Resolve
                    </button>
                </td>
            </tr>
        ));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Admin - Dispute Management</h1>
                <div className="text-sm text-gray-600">
                    Total: {pagination.totalElements} disputes
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            id="status-filter"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="PROCESSING">Processing</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="issueType-filter" className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                        <select
                            id="issueType-filter"
                            value={filters.issueType}
                            onChange={(e) => setFilters(prev => ({ ...prev, issueType: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Issues</option>
                            <option value="NOT_DELIVERED">Not Delivered</option>
                            <option value="ITEM_INVALID">Item Invalid</option>
                            <option value="ACCOUNT_BANNED">Account Banned</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Disputes Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dispute Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {renderTableContent()}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(0, prev.currentPage - 1) }))}
                            disabled={pagination.currentPage === 0}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                            disabled={pagination.currentPage >= pagination.totalPages - 1}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{pagination.currentPage + 1}</span> of{' '}
                                <span className="font-medium">{pagination.totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(0, prev.currentPage - 1) }))}
                                    disabled={pagination.currentPage === 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resolve Dispute Modal */}
            {resolveModal && selectedDispute && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Resolve Dispute
                            </h3>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Dispute ID: {selectedDispute.id}
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    Order ID: {selectedDispute.orderId}
                                </p>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="resolution-status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Resolution Status
                                </label>
                                <select
                                    id="resolution-status"
                                    value={resolveData.status}
                                    onChange={(e) => setResolveData(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                    <option value="PROCESSING">Processing</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={resolveData.autoRefund}
                                        onChange={(e) => setResolveData(prev => ({ ...prev, autoRefund: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Auto refund to buyer</span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setResolveModal(false);
                                        setSelectedDispute(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResolveDispute}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Resolving...' : 'Resolve Dispute'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDisputeManagement;