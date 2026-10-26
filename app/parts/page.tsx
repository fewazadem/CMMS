
"use client";
import React, { useEffect, useState } from 'react';

type Part = {
  id: string;
  name: string;
  partNumber: string;
  qtyOnHand: number;
  minQty: number;
  location: string;
};

export default function PartsInventory() {
  const [partsList, setPartsList] = useState<Part[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    partNumber: '',
    qtyOnHand: 0,
    minQty: 0,
    location: ''
  });

  useEffect(() => {
    fetch('/api/parts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPartsList(data);
        } else {
          console.error("Database Error:", data);
        }
      })
      .catch(err => console.error("Failed to load parts", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          ...formData
        })
      });

      if (response.ok) {
        const newPart = await response.json();
        setPartsList([...partsList, newPart]);
        setIsModalOpen(false);
        setFormData({
          name: '',
          partNumber: '',
          qtyOnHand: 0,
          minQty: 0,
          location: ''
        });
      } else {
        const errorData = await response.json();
        alert("Failed to save part: " + (errorData.error || response.statusText));
      }
    } catch (error) {
      alert("Network error: Could not reach the API.");
      console.error(error);
    }
  };

  const lowStockCount = partsList.filter(
    p => p.qtyOnHand <= p.minQty
  ).length;

  return (
    <div className="min-h-screen bg-white p-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Parts & Inventory
          </h1>
          <p className="text-gray-500 text-sm">
            Low stock alerts: {lowStockCount} items need reordering
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black border border-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
        >
          + Add Part
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200 text-sm">
              <th className="p-4 font-medium text-gray-600">Part Name</th>
              <th className="p-4 font-medium text-gray-600">Part Number</th>
              <th className="p-4 font-medium text-gray-600">Location</th>
              <th className="p-4 font-medium text-gray-600 text-right">
                Qty on Hand
              </th>
              <th className="p-4 font-medium text-gray-600 text-right">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {partsList.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400"
                >
                  No parts found in inventory.
                </td>
              </tr>
            ) : (
              partsList.map(part => (
                <tr
                  key={part.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium text-black">
                    {part.name}
                  </td>
                  <td className="p-4 text-gray-600">
                    {part.partNumber || '-'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {part.location || '-'}
                  </td>
                  <td className="p-4 text-right font-mono text-black">
                    {part.qtyOnHand}
                  </td>
                  <td className="p-4 text-right">
                    {part.qtyOnHand <= part.minQty ? (
                      <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-medium border border-red-200">
                        Reorder
                      </span>
                    ) : (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Part Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-black rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              Add New Part
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Part Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({
                    ...formData,
                    name: e.target.value
                  })}
                  className="w-full bg-white text-black border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. V-Belt B45"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Part / SKU Number
                </label>
                <input
                  type="text"
                  value={formData.partNumber}
                  onChange={e => setFormData({
                    ...formData,
                    partNumber: e.target.value
                  })}
                  className="w-full bg-white text-black border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. VB-B45-001"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qty On Hand
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.qtyOnHand}
                    onChange={e => setFormData({
                      ...formData,
                      qtyOnHand: parseInt(e.target.value) || 0
                    })}
                    className="w-full bg-white text-black border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minQty}
                    onChange={e => setFormData({
                      ...formData,
                      minQty: parseInt(e.target.value) || 0
                    })}
                    className="w-full bg-white text-black border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({
                    ...formData,
                    location: e.target.value
                  })}
                  className="w-full bg-white text-black border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. Shelf A2, Bin 4"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  Save Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
