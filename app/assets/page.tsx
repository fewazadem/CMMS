"use client";
import React, { useState, useEffect } from 'react';

type Asset = {
  id: string;
  name: string;
  tagNumber: string;
  category: string;
  status: string;
  location: string;
};

const initialAssets: Asset[] = [
  { id: '1', name: 'CNC Machine #2', tagNumber: 'CNC-002', category: 'Machining', status: 'Operational', location: 'Plant Floor A' },
  { id: '2', name: 'Hydraulic Press #1', tagNumber: 'HYD-001', category: 'Pressing', status: 'Maintenance', location: 'Plant Floor B' },
  { id: '3', name: 'Air Compressor Unit #1', tagNumber: 'CMP-001', category: 'Utilities', status: 'Operational', location: 'Utility Room' },
  { id: '4', name: 'Industrial Lathe #1', tagNumber: 'LAT-001', category: 'Machining', status: 'Operational', location: 'Plant Floor A' },
  { id: '5', name: 'Conveyer Belt A', tagNumber: 'CON-001', category: 'Handling', status: 'Offline', location: 'Packaging Line' }
];

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tagNumber: '',
    category: 'Machining',
    status: 'Operational',
    location: ''
  });

  // Load assets from localStorage
  useEffect(() => {
    const savedAssets = localStorage.getItem('cmms_assets');
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch (e) {
        setAssets(initialAssets);
      }
    } else {
      setAssets(initialAssets);
      localStorage.setItem('cmms_assets', JSON.stringify(initialAssets));
    }
  }, []);

  const updateAssetsStore = (newAssets: Asset[]) => {
    setAssets(newAssets);
    localStorage.setItem('cmms_assets', JSON.stringify(newAssets));
  };

  const openCreateModal = () => {
    setEditMode('create');
    setActiveId(null);
    setFormData({ name: '', tagNumber: '', category: 'Machining', status: 'Operational', location: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditMode('edit');
    setActiveId(asset.id);
    setFormData({
      name: asset.name,
      tagNumber: asset.tagNumber || '',
      category: asset.category || 'Machining',
      status: asset.status || 'Operational',
      location: asset.location || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode === 'edit' && activeId) {
      const updated = assets.map(a => a.id === activeId ? { ...a, ...formData } : a);
      updateAssetsStore(updated);
    } else {
      const newAsset: Asset = {
        id: crypto.randomUUID(),
        ...formData
      };
      updateAssetsStore([newAsset, ...assets]);
    }
    setIsModalOpen(false);
  };

  const deleteAsset = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      const updated = assets.filter(a => a.id !== id);
      updateAssetsStore(updated);
    }
  };

  const filteredAssets = assets.filter(a => {
    if (filter === 'All') return true;
    return a.status === filter;
  });

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-black font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Assets & Machinery</h1>
            <p className="text-gray-500 text-sm">Monitor plant equipment, tags, and operational states</p>
          </div>
          <button onClick={openCreateModal} className="bg-gray-900 text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-800 transition shadow-sm">
            + Add Asset
          </button>
        </div>

        {/* --- FILTER TABS --- */}
        <div className="flex gap-2 mb-6">
          {['All', 'Operational', 'Maintenance', 'Offline'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === status ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* --- ASSETS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
              No assets found.
            </div>
          ) : (
            filteredAssets.map(asset => (
              <div key={asset.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{asset.name}</h3>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      asset.status === 'Operational' ? 'bg-green-100 text-green-800' :
                      asset.status === 'Maintenance' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600 mb-6">
                    <p><strong className="text-gray-700">Tag ID:</strong> {asset.tagNumber || 'N/A'}</p>
                    <p><strong className="text-gray-700">Category:</strong> {asset.category}</p>
                    <p><strong className="text-gray-700">Location:</strong> {asset.location || 'Main Plant'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button onClick={() => openEditModal(asset)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition">
                    Edit
                  </button>
                  <button onClick={() => deleteAsset(asset.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* --- ADD / EDIT ASSET MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editMode === 'create' ? 'Add New Asset' : 'Edit Asset'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. Hydraulic Press #2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag Number</label>
                  <input type="text" value={formData.tagNumber} onChange={e => setFormData({...formData, tagNumber: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. HYD-002" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. Machining" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-gray-900">
                    <option>Operational</option>
                    <option>Maintenance</option>
                    <option>Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. Plant Floor A" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 shadow-sm">{editMode === 'create' ? 'Save Asset' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}