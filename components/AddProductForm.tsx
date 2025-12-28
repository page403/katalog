'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductForm() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [pcsPrice, setPcsPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await fetch('/api/tags');
        if (res.ok) {
          setTags(await res.json());
        }
      } catch {}
    };
    loadTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price, pcsPrice, description, image, tagIds: selectedTagIds }),
      });

      if (res.ok) {
        setMessage('Product added successfully!');
        setTitle('');
        setPrice('');
        setDescription('');
        setImage('');
        setSelectedTagIds([]);
        router.refresh();
      } else {
        setMessage('Failed to add product');
      }
    } catch (err) {
      setMessage('An error occurred');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Product</h2>
        <button 
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
      {message && (
        <p className={`mb-4 text-center ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price per PCS (optional)</label>
          <input
            type="number"
            value={pcsPrice}
            onChange={(e) => setPcsPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Leave empty if not applicable"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Image URL</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              value={newTagName}
              onChange={(e) => setNewTagName((e.target as HTMLInputElement).value)}
              placeholder="Add or search tag"
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && newTagName.trim()) {
                  try {
                    const res = await fetch('/api/tags', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newTagName.trim() }),
                    });
                    if (res.ok) {
                      const tag = await res.json();
                      setTags((prev) => {
                        const exists = prev.find((t) => t.id === tag.id);
                        return exists ? prev : [...prev, tag];
                      });
                      setSelectedTagIds((prev) => Array.from(new Set([...prev, tag.id])));
                      setNewTagName('');
                    }
                  } catch {}
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const selected = selectedTagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`px-2 py-1 rounded text-sm ring-1 ${selected ? 'bg-blue-600 text-white ring-blue-600' : 'bg-gray-100 text-gray-800 ring-gray-300'}`}
                  onClick={() =>
                    setSelectedTagIds((prev) =>
                      selected ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                    )
                  }
                >
                  {t.name}
                </button>
              );
            })}
            {tags.length === 0 && <span className="text-xs text-gray-500">No tags available</span>}
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
