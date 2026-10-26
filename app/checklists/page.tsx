"use client";
import React, { useEffect, useState } from 'react';

type Checklist = {
  id: string; title: string; frequency: string; targetAsset: string; items: string;
};

export default function ChecklistsPage() {
  const [checklistsList, setChecklistsList] = useState<Checklist[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', frequency: 'Daily', targetAsset: '', items: ''
  });

  useEffect(() => {
    fetch('/api/checklists')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChecklistsList(data);
        }
      })
      .catch(err => console.error("Failed to load checklists", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          ...formData
        })
      });

      if (response.ok) {
        const newChecklist = await response.json();
        setChecklistsList([...checklistsList, newChecklist]);
        setIsModalOpen(false);
        setFormData({ title: '', frequency: 'Daily', targetAsset: '', items: '' });
      } else {
        const errorData = await response.json();
        alert("Failed to save: " + (errorData.error || response.statusText));
      }
    } catch (error) {
      alert("Network error: Could not reach the API.");
      console.error(error);
    }
  };

  return (
    <div className="p-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checklists & Meters</h1>
          <p className="text-gray-500 text-sm">Manage SOPs, inspections, and meter reading tasks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition">
          + New Checklist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checklistsList.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-lg">
            No checklists found. Click "+ New Checklist" to create your first inspection routine.
          </div>
        ) : (
          checklistsList.map((checklist) => (
            <div key={checklist.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900 leading-tight">{checklist.title}</h3>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-1 rounded font-medium">
                  {checklist.frequency}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4 font-medium">
                Target: <span className="text-gray-900">{checklist.targetAsset || "Global / All Assets"}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 whitespace-pre-wrap font-mono text-xs border border-gray-100">
                {checklist.items}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 border border-gray-300 text-gray-700 py-1.5 rounded text-sm hover:bg-gray-50 font-medium">Edit</button>
                <button className="flex-1 bg-black text-white py-1.5 rounded text-sm hover:bg-gray-800 font-medium">Start Task</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Checklist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create Inspection Checklist</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Checklist Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. Daily Forklift Inspection" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Pre-Shift</option>
                    <option>Post-Shift</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Asset Tag (Optional)</label>
                  <input type="text" value={formData.targetAsset} onChange={e => setFormData({...formData, targetAsset: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. FK-001" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Checklist Items (One per line)</label>
                <textarea required rows={5} value={formData.items} onChange={e => setFormData({...formData, items: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm" placeholder="- Check hydraulic fluid levels&#10;- Inspect forks for damage&#10;- Record hour meter reading"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">Save Checklist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}