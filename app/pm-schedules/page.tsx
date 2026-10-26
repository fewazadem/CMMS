"use client";
import React, { useState, useEffect } from 'react';

type Asset = { id: string; name: string; tagNumber?: string; };

const initialPMSchedules = [
  { id: '1', title: 'Monthly Air Compressor Service', frequency: 'Monthly', asset: 'Air Compressor Unit #1', description: 'Check belts, drain tank condensate, replace air filter.', nextDueDate: 'Sep 25, 2026' },
  { id: '2', title: 'Bi-Weekly CNC Lubrication', frequency: 'Bi-Weekly', asset: 'CNC Machine #2', description: 'Grease linear guides and check coolant concentration.', nextDueDate: 'Sep 15, 2026' },
  { id: '3', title: 'Quarterly Hydraulic Fluid Analysis', frequency: 'Quarterly', asset: 'Hydraulic Press #1', description: 'Take oil sample for lab viscosity and contamination testing.', nextDueDate: 'Oct 01, 2026' }
];

export default function PMSchedulesPage() {
  const [pmSchedules, setPmSchedules] = useState(initialPMSchedules);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isStartTaskModalOpen, setIsStartTaskModalOpen] = useState(false);
  const [activePM, setActivePM] = useState<any>(null);
  
  const [taskFormData, setTaskFormData] = useState({
    asset: '',
    priority: 'Medium',
    assignedTo: ''
  });

  useEffect(() => {
    fetch('/api/assets').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAssets(data);
    }).catch(err => console.error("Failed to fetch assets", err));
  }, []);

  const openStartTaskModal = (pm: any) => {
    setActivePM(pm);
    setTaskFormData({
      asset: pm.asset || '',
      priority: 'Medium',
      assignedTo: ''
    });
    setIsStartTaskModalOpen(true);
  };

  const handleStartTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePM) return;

    const newWorkOrder = {
      id: crypto.randomUUID(),
      title: `[PM] ${activePM.title}`,
      description: activePM.description || 'Routine Preventive Maintenance',
      asset: taskFormData.asset,
      type: 'Preventive',
      priority: taskFormData.priority,
      status: 'Open',
      assignedTo: taskFormData.assignedTo || 'Unassigned',
      dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: activePM.nextDueDate
    };

    // Save to shared localStorage so Work Orders & Dashboard pick it up instantly
    const existingWOs = JSON.parse(localStorage.getItem('cmms_work_orders') || '[]');
    localStorage.setItem('cmms_work_orders', JSON.stringify([newWorkOrder, ...existingWOs]));

    setIsStartTaskModalOpen(false);
    alert(`Task Started! Work Order generated for ${taskFormData.asset}.`);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-black font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Preventive Maintenance Schedules</h1>
            <p className="text-gray-500 text-sm">Manage recurring maintenance routines and automatically generate work orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pmSchedules.map(pm => (
            <div key={pm.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{pm.title}</h3>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full">{pm.frequency}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{pm.description}</p>
                <div className="space-y-1 text-sm text-gray-500 mb-6">
                  <p><strong className="text-gray-700">Asset:</strong> {pm.asset || 'General Facility'}</p>
                  <p><strong className="text-gray-700">Next Due:</strong> {pm.nextDueDate}</p>
                </div>
              </div>

              <button 
                onClick={() => openStartTaskModal(pm)}
                className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm flex items-center justify-center gap-2">
                <span>⚡</span> Start Task (Generate WO)
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Start Task Modal */}
      {isStartTaskModalOpen && activePM && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Start PM Task</h2>
              <button onClick={() => setIsStartTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">This will generate a new Work Order for: <strong className="text-gray-800">{activePM.title}</strong></p>

            <form onSubmit={handleStartTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Asset *</label>
                <select required value={taskFormData.asset} onChange={e => setTaskFormData({...taskFormData, asset: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">-- Select Machine --</option>
                  {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={taskFormData.priority} onChange={e => setTaskFormData({...taskFormData, priority: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-gray-900">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input type="text" value={taskFormData.assignedTo} onChange={e => setTaskFormData({...taskFormData, assignedTo: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="Technician name" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsStartTaskModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 shadow-sm">Generate Work Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}