'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  price: number;
  description?: string;
  image?: string;
  supplierId?: string | null;
  tagId?: string | null;
  status?: 'published' | 'archived';
}

interface AdminDashboardProps {
  initialProducts: Product[];
}

export default function AdminDashboard({ initialProducts }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [supplierId, setSupplierId] = useState<string | ''>('');
  const [tagId, setTagId] = useState<string | ''>('');
  const [message, setMessage] = useState('');
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [sRes, tRes] = await Promise.all([fetch('/api/suppliers'), fetch('/api/tags')]);
        if (sRes.ok) {
          setSuppliers(await sRes.json());
        }
        if (tRes.ok) {
          setTags(await tRes.json());
        }
      } catch {}
    };
    loadMeta();
  }, []);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setImage('');
    setSupplierId('');
    setTagId('');
    setEditingId(null);
    setMessage('');
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price.toString());
    setDescription(product.description || '');
    setImage(product.image || '');
    setSupplierId(product.supplierId || '');
    setTagId(product.tagId || '');
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
      description,
      image,
      supplierId: supplierId || null,
      tagId: tagId || null,
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

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) return;
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSupplierName.trim() }),
      });
      if (res.ok) {
        const sup = await res.json();
        setSuppliers([...suppliers, sup]);
        setNewSupplierName('');
      }
    } catch {}
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

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          {editingId && (
            <button 
              onClick={resetForm}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        {message && (
          <p className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 mb-2">Tag</label>
            <select
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              className={`w-full text-white py-2 rounded transition-colors ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-xl font-bold mb-4">Manage Suppliers and Tags</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Add Supplier</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Supplier name"
              />
              <button
                onClick={handleAddSupplier}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                type="button"
              >
                Add
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Add Tag</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tag name"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                type="button"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product List Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6">Product List</h2>
        <div className="overflow-x-auto">
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
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative h-10 w-10">
                      <Image
                        src={product.image || 'https://placehold.co/400'}
                        alt={product.title}
                        fill
                        className="object-contain rounded-full bg-gray-50"
                        sizes="40px"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp. {product.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${product.status === 'archived' ? 'bg-yellow-50 text-yellow-700 ring-yellow-200' : 'bg-green-50 text-green-700 ring-green-200'}`}>
                      {product.status === 'archived' ? 'Archived' : 'Published'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditClick(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    {product.status === 'archived' ? (
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/products/toggle', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: product.id, status: 'published' }),
                            });
                            if (res.ok) {
                              const updated = await res.json();
                              setProducts(products.map(p => p.id === product.id ? updated : p));
                              router.refresh();
                            } else {
                              alert('Failed to publish product');
                            }
                          } catch {}
                        }}
                        className="text-green-700 hover:text-green-900 mr-4"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/products/toggle', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: product.id, status: 'archived' }),
                            });
                            if (res.ok) {
                              const updated = await res.json();
                              setProducts(products.map(p => p.id === product.id ? updated : p));
                              router.refresh();
                            } else {
                              alert('Failed to archive product');
                            }
                          } catch {}
                        }}
                        className="text-yellow-700 hover:text-yellow-900 mr-4"
                      >
                        Archive
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteClick(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
