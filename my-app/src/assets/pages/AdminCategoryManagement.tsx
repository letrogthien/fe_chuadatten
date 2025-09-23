import React, { useState } from 'react';

// Sample data cho category management
const sampleCategoryData = {
  categories: [
    {
      id: "cat-001",
      name: "Game Mobile",
      slug: "game-mobile",
      description: "Các tài khoản và vật phẩm game mobile",
      parentId: null,
      ancestors: [],
      children: ["cat-002", "cat-003", "cat-004"],
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-12-20T14:30:00Z",
      productCount: 1250
    },
    {
      id: "cat-002", 
      name: "Liên Quân Mobile",
      slug: "lien-quan-mobile",
      description: "Tài khoản và skin Liên Quân Mobile",
      parentId: "cat-001",
      ancestors: ["cat-001"],
      children: [],
      isActive: true,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-12-18T09:15:00Z",
      productCount: 456
    },
    {
      id: "cat-003",
      name: "PUBG Mobile", 
      slug: "pubg-mobile",
      description: "Tài khoản PUBG Mobile full skin và UC",
      parentId: "cat-001",
      ancestors: ["cat-001"],
      children: [],
      isActive: true,
      createdAt: "2024-01-15T10:45:00Z",
      updatedAt: "2024-12-19T16:20:00Z",
      productCount: 342
    },
    {
      id: "cat-004",
      name: "Free Fire",
      slug: "free-fire",
      description: "Tài khoản Free Fire VIP và Kim Cương",
      parentId: "cat-001",
      ancestors: ["cat-001"],
      children: [],
      isActive: true,
      createdAt: "2024-01-15T11:00:00Z",
      updatedAt: "2024-12-17T11:45:00Z",
      productCount: 278
    },
    {
      id: "cat-005",
      name: "Game PC",
      slug: "game-pc",
      description: "Tài khoản và key game PC",
      parentId: null,
      ancestors: [],
      children: ["cat-006", "cat-007"],
      isActive: true,
      createdAt: "2024-01-15T11:15:00Z",
      updatedAt: "2024-12-16T13:10:00Z",
      productCount: 890
    },
    {
      id: "cat-006",
      name: "Steam Games",
      slug: "steam-games",
      description: "Key game Steam và tài khoản Steam",
      parentId: "cat-005",
      ancestors: ["cat-005"],
      children: [],
      isActive: true,
      createdAt: "2024-01-15T11:30:00Z",
      updatedAt: "2024-12-15T08:25:00Z",
      productCount: 523
    },
    {
      id: "cat-007",
      name: "Valorant",
      slug: "valorant",
      description: "Tài khoản Valorant và VP",
      parentId: "cat-005",
      ancestors: ["cat-005"],
      children: [],
      isActive: false,
      createdAt: "2024-01-15T11:45:00Z",
      updatedAt: "2024-12-14T15:40:00Z",
      productCount: 189
    }
  ],
  statistics: {
    totalCategories: 7,
    activeCategories: 6,
    inactiveCategories: 1,
    totalProducts: 3428,
    rootCategories: 2
  }
};

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  isActive: boolean;
}

const AdminCategoryManagement: React.FC = () => {
  const [categoryData] = useState(sampleCategoryData);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    isActive: true
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Hoạt động' : 'Tạm dừng'}
      </span>
    );
  };

  const getCategoryHierarchy = (category: any) => {
    if (!category.ancestors || category.ancestors.length === 0) {
      return category.name;
    }
    
    const ancestorNames = category.ancestors.map((ancestorId: string) => {
      const ancestor = categoryData.categories.find(cat => cat.id === ancestorId);
      return ancestor?.name || 'Unknown';
    });
    
    return `${ancestorNames.join(' > ')} > ${category.name}`;
  };

  const handleCreateCategory = async (categoryData: CategoryFormData) => {
    console.log('Creating category:', categoryData);
    // Gọi API createCategory từ productCategoryApi
    alert(`Đã tạo danh mục: ${categoryData.name}`);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateCategory = async (categoryId: string, categoryData: CategoryFormData) => {
    console.log('Updating category:', categoryId, categoryData);
    // Gọi API updateCategory từ productCategoryApi
    alert(`Đã cập nhật danh mục: ${categoryData.name}`);
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.')) {
      console.log('Deleting category:', categoryId);
      // Gọi API deleteCategory từ productCategoryApi
      alert(`Đã xóa danh mục: ${categoryId}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: null,
      isActive: true
    });
  };

  const openEditModal = (category: any) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive
    });
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setFormData(prev => ({ ...prev, name, slug }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
              <p className="text-sm text-gray-500 mt-1">Tạo và quản lý cấu trúc danh mục sản phẩm</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              + Thêm danh mục
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📁</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng danh mục</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {categoryData.statistics.totalCategories}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đang hoạt động</p>
                <p className="text-2xl font-semibold text-green-600">
                  {categoryData.statistics.activeCategories}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng sản phẩm</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {categoryData.statistics.totalProducts.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🌳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Danh mục gốc</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {categoryData.statistics.rootCategories}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Danh sách danh mục</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phân cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cập nhật
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryData.categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.slug}</p>
                        <p className="text-xs text-gray-400 mt-1">{category.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{getCategoryHierarchy(category)}</p>
                      <p className="text-xs text-gray-500">
                        {category.children.length > 0 ? `${category.children.length} danh mục con` : 'Không có danh mục con'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-blue-600">{category.productCount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(category.isActive)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">{formatDate(category.updatedAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-500 text-sm font-medium"
                          disabled={category.children.length > 0}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Category Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Tạo danh mục mới</h3>
                  <button
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(formData); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Slug</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Danh mục cha</label>
                      <select
                        value={formData.parentId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value || null }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">-- Không có (Danh mục gốc) --</option>
                        {categoryData.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {getCategoryHierarchy(cat)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Kích hoạt danh mục
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4 mt-6 border-t">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                    >
                      Tạo danh mục
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCreateModal(false); resetForm(); }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && selectedCategory && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Chỉnh sửa danh mục</h3>
                  <button
                    onClick={() => { setShowEditModal(false); resetForm(); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateCategory(selectedCategory.id, formData); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Slug</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Danh mục cha</label>
                      <select
                        value={formData.parentId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value || null }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">-- Không có (Danh mục gốc) --</option>
                        {categoryData.categories
                          .filter(cat => cat.id !== selectedCategory.id) // Không cho phép chọn chính nó
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {getCategoryHierarchy(cat)}
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="editIsActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-900">
                        Kích hoạt danh mục
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4 mt-6 border-t">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                    >
                      Cập nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowEditModal(false); resetForm(); }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCategoryManagement;