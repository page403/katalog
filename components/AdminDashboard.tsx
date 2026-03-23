'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
 

interface Product {
  id: string;
  title: string;
  price: number;
  pcsPrice?: number | null;
  description?: string;
  image?: string;
  supplierId?: string | null;
  tagId?: string | null;
  tagIds?: string[];
  status?: 'published' | 'archived';
  categoryId?: string | null;
}

interface Banner {
  id: string;
  title: string;
  price: number;
  image: string;
  link?: string;
  active: boolean;
}

interface Supplier {
  id: string;
  name: string;
  logo?: string;
}

interface AdminDashboardProps {
  initialProducts: Product[];
}

export default function AdminDashboard({ initialProducts }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // View State
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'suppliers' | 'banners' | 'settings'>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Supplier Form State
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [supplierLogo, setSupplierLogo] = useState('');
  const [supplierMessage, setSupplierMessage] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [pcsPrice, setPcsPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [supplierId, setSupplierId] = useState<string | ''>('');
  const [tagId, setTagId] = useState<string | ''>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState<string | ''>('');

  // Banner Form State
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerPrice, setBannerPrice] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerActive, setBannerActive] = useState(true);
  const [bannerMessage, setBannerMessage] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [sRes, tRes, cRes, bRes] = await Promise.all([
          fetch('/api/suppliers'),
          fetch('/api/tags'),
          fetch('/api/categories'),
          fetch('/api/banner')
        ]);
        if (sRes.ok) {
          setSuppliers(await sRes.json());
        }
        if (tRes.ok) {
          setTags(await tRes.json());
        }
        if (cRes.ok) {
          setCategories(await cRes.json());
        }
        if (bRes.ok) {
          setBanners(await bRes.json());
        }
      } catch {}
    };
    loadMeta();
  }, []);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setPcsPrice('');
    setDescription('');
    setImage('');
    setSupplierId('');
    setTagId('');
    setSelectedTagIds([]);
    setCategoryId('');
    setEditingId(null);
    setMessage('');
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price.toString());
    setPcsPrice(product.pcsPrice != null ? product.pcsPrice.toString() : '');
    setDescription(product.description || '');
    setImage(product.image || '');
    setSupplierId(product.supplierId || '');
    setTagId(product.tagId || '');
    setSelectedTagIds(product.tagIds || (product.tagId ? [product.tagId] : []));
    setCategoryId(product.categoryId || '');
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      alert('An error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const productData = {
      title,
      price,
      pcsPrice,
      description,
      image,
      supplierId: supplierId || null,
      tagId: tagId || null,
      tagIds: selectedTagIds,
      categoryId: categoryId || null,
      ...(editingId && { id: editingId }),
    };

    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        const updatedProduct = await res.json();
        
        if (editingId) {
          setProducts(products.map(p => p.id === editingId ? updatedProduct : p));
          setMessage('Product updated successfully!');
        } else {
          setProducts([...products, updatedProduct]);
          setMessage('Product added successfully!');
        }
        
        resetForm();
        router.refresh();
      } else {
        setMessage(`Failed to ${editingId ? 'update' : 'add'} product`);
      }
    } catch (err) {
      setMessage('An error occurred');
    }
  };

  const resetBannerForm = () => {
    setBannerTitle('');
    setBannerPrice('');
    setBannerImage('');
    setBannerLink('');
    setBannerActive(true);
    setEditingBannerId(null);
    setBannerMessage('');
  };

  const handleBannerEditClick = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setBannerTitle(banner.title);
    setBannerPrice(banner.price.toString());
    setBannerImage(banner.image);
    setBannerLink(banner.link || '');
    setBannerActive(banner.active);
    setBannerMessage('');
  };

  const handleBannerDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch(`/api/banner?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBanners(banners.filter(b => b.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete banner');
      }
    } catch (err) {
      alert('An error occurred');
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerMessage('');

    const bannerData = {
      title: bannerTitle,
      price: bannerPrice,
      image: bannerImage,
      link: bannerLink,
      active: bannerActive,
      ...(editingBannerId && { id: editingBannerId }),
    };

    const method = editingBannerId ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/banner', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData),
      });

      if (res.ok) {
        const updatedBanner = await res.json();
        
        if (editingBannerId) {
          setBanners(banners.map(b => b.id === editingBannerId ? updatedBanner : b));
          setBannerMessage('Banner updated successfully!');
        } else {
          setBanners([...banners, updatedBanner]);
          setBannerMessage('Banner added successfully!');
        }
        
        resetBannerForm();
        router.refresh();
      } else {
        setBannerMessage(`Failed to ${editingBannerId ? 'update' : 'add'} banner`);
      }
    } catch (err) {
      setBannerMessage('An error occurred');
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      if (res.ok) {
        const tag = await res.json();
        setTags([...tags, tag]);
        setNewTagName('');
      }
    } catch {}
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories([...categories, cat]);
        setNewCategoryName('');
      }
    } catch {}
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.refresh();
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierMessage('');

    const method = editingSupplierId ? 'PUT' : 'POST';
    const body = {
      name: supplierName,
      logo: supplierLogo,
      ...(editingSupplierId && { id: editingSupplierId }),
    };

    try {
      const res = await fetch('/api/suppliers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingSupplierId) {
          setSuppliers(suppliers.map((s) => (s.id === editingSupplierId ? saved : s)));
          setSupplierMessage('Supplier updated successfully!');
        } else {
          setSuppliers([...suppliers, saved]);
          setSupplierMessage('Supplier added successfully!');
        }
        setSupplierName('');
        setSupplierLogo('');
        setEditingSupplierId(null);
      } else {
        const err = await res.json();
        setSupplierMessage(err.error || 'Failed to save supplier');
      }
    } catch {
      setSupplierMessage('An error occurred');
    }
  };

  const handleSupplierEdit = (s: any) => {
    setEditingSupplierId(s.id);
    setSupplierName(s.name);
    setSupplierLogo(s.logo || '');
    setSupplierMessage('');
  };

  const handleSupplierDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      const res = await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuppliers(suppliers.filter((s) => s.id !== id));
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 flex flex-col absolute left-0 fixed h-full z-20`}
      >
        <div className="p-4 flex items-center justify-between">
          {!sidebarCollapsed && <span className="text-xl font-bold">Admin</span>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="flex-1 mt-4 space-y-2 px-2">
          <button
            onClick={() => setCurrentView('home')}
            className={`w-full flex items-center p-3 rounded transition-colors ${
              currentView === 'home' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <span className="text-xl mr-3">🏠</span>
            {!sidebarCollapsed && <span>Home</span>}
          </button>
          <button
            onClick={() => setCurrentView('products')}
            className={`w-full flex items-center p-3 rounded transition-colors ${
              currentView === 'products' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <span className="text-xl mr-3">📦</span>
            {!sidebarCollapsed && <span>Products</span>}
          </button>
          <button
            onClick={() => setCurrentView('suppliers')}
            className={`w-full flex items-center p-3 rounded transition-colors ${
              currentView === 'suppliers' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <span className="text-xl mr-3">🏢</span>
            {!sidebarCollapsed && <span>Suppliers</span>}
          </button>
          <button
            onClick={() => setCurrentView('banners')}
            className={`w-full flex items-center p-3 rounded transition-colors ${
              currentView === 'banners' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <span className="text-xl mr-3">🖼️</span>
            {!sidebarCollapsed && <span>Banners</span>}
          </button>
        </nav>

        <div className="p-2 mt-auto">
          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center p-3 rounded transition-colors mb-2 ${
              currentView === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <span className="text-xl mr-3">⚙️</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded hover:bg-red-700 text-red-400 hover:text-white transition-colors"
          >
            <span className="text-xl mr-3">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } p-8`}
      >
        <div className="max-w-6xl mx-auto">
          {currentView === 'home' && (
            <div>
              <h1 className="text-3xl font-bold mb-8 text-gray-800">Welcome, Admin</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Products</h3>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Suppliers</h3>
                  <p className="text-3xl font-bold text-gray-900">{suppliers.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Active Banners</h3>
                  <p className="text-3xl font-bold text-gray-900">{banners.filter(b => b.active).length}</p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
              </div>

              {/* Product Form Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                  {editingId && (
                    <button onClick={resetForm} className="text-gray-600 hover:text-gray-800 text-sm">
                      Cancel Edit
                    </button>
                  )}
                </div>
                {message && (
                  <p
                    className={`mb-4 text-sm px-3 py-2 rounded ${
                      message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {message}
                  </p>
                )}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-gray-700 mb-2">Price per PCS (optional)</label>
                    <input
                      type="number"
                      value={pcsPrice}
                      onChange={(e) => setPcsPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-gray-700 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-gray-700 mb-2">Supplier</label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-gray-700 mb-2">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <button
                      className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                        editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                      type="submit"
                    >
                      {editingId ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Product List Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative h-10 w-10">
                            <Image
                              src={product.image || 'https://placehold.co/400'}
                              alt={product.title}
                              fill
                              className="object-contain rounded bg-gray-50"
                              unoptimized
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp. {product.price.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            product.status === 'archived' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {product.status === 'archived' ? 'Archived' : 'Published'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                          <button onClick={() => handleDeleteClick(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'banners' && (
            <div>
              <h1 className="text-3xl font-bold mb-8 text-gray-800">Banner Management</h1>
              
              {/* Banner Form Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{editingBannerId ? 'Edit Banner' : 'Add New Banner'}</h2>
                  {editingBannerId && (
                    <button 
                      onClick={resetBannerForm}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                {bannerMessage && (
                  <p className={`mb-4 text-sm px-3 py-2 rounded ${bannerMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {bannerMessage}
                  </p>
                )}

                <form onSubmit={handleBannerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-gray-700 mb-2">Banner Title</label>
                    <input
                      type="text"
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-gray-700 mb-2">Price (optional)</label>
                    <input
                      type="number"
                      value={bannerPrice}
                      onChange={(e) => setBannerPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/banner.jpg"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-gray-700 mb-2">Link (optional)</label>
                    <input
                      type="text"
                      value={bannerLink}
                      onChange={(e) => setBannerLink(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/category/electronics or https://..."
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <label className="flex items-center text-gray-700 cursor-pointer mt-6">
                      <input
                        type="checkbox"
                        checked={bannerActive}
                        onChange={(e) => setBannerActive(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                      />
                      Active
                    </label>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <button
                      className={`w-full px-4 py-2 rounded-lg text-white font-medium ${editingBannerId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      type="submit"
                    >
                      {editingBannerId ? 'Update Banner' : 'Add Banner'}
                    </button>
                  </div>
                </form>
              </div>

              {banners.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {banners.map((banner) => (
                        <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative h-10 w-20 bg-gray-100 rounded overflow-hidden">
                              <Image
                                src={banner.image}
                                alt={banner.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{banner.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {banner.price ? `Rp. ${banner.price.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${banner.active ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-gray-50 text-gray-700 ring-gray-200'}`}>
                              {banner.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleBannerEditClick(banner)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleBannerDeleteClick(banner.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {currentView === 'suppliers' && (
            <div>
              <h1 className="text-3xl font-bold mb-8 text-gray-800">Supplier Management</h1>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-10">
                <h2 className="text-xl font-bold mb-6">{editingSupplierId ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                {supplierMessage && (
                  <p className={`mb-4 text-sm px-3 py-2 rounded ${supplierMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {supplierMessage}
                  </p>
                )}
                <form onSubmit={handleSupplierSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Logo URL</label>
                    <input
                      type="url"
                      value={supplierLogo}
                      onChange={(e) => setSupplierLogo(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      {editingSupplierId ? 'Update Supplier' : 'Add Supplier'}
                    </button>
                    {editingSupplierId && (
                      <button type="button" onClick={() => { setEditingSupplierId(null); setSupplierName(''); setSupplierLogo(''); }} className="w-full mt-2 text-gray-600 hover:text-gray-800">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative h-10 w-10">
                            {s.logo ? (
                              <Image src={s.logo} alt={s.name} fill className="object-contain rounded" unoptimized />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-bold">
                                {s.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleSupplierEdit(s)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                          <button onClick={() => handleSupplierDelete(s.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div>
              <h1 className="text-3xl font-bold mb-8 text-gray-800">Settings</h1>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Meta Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Tags</label>
                    <div className="flex gap-2 mb-4">
                      <input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="New tag"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={handleAddTag} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(t => (
                        <span key={t.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-200">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Categories</label>
                    <div className="flex gap-2 mb-4">
                      <input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={handleAddCategory} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(c => (
                        <span key={c.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-200">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
