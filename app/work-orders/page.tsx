"use client";
import React, { useEffect, useState } from 'react';

type Asset = { id: string; name: string; tagNumber?: string; };
type WorkOrder = {
  id: string;
  title: string;
  description: string;
  asset: string;
  type: string;
  priority: string;
  status: string;
  assignedTo: string;
  dateCreated: string;
  dueDate: string;
};

const initialWorkOrders: WorkOrder[] = [
  {
    id: '1',
    title: 'Spindle Bearing Noise Inspection',
    description: 'Unusual humming sound reported during high RPM operations.',
    asset: 'CNC Machine #2',
    type: 'Corrective',
    priority: 'High',
    status: 'Open',
    assignedTo: 'Fewaz Adem',
    dateCreated: 'Sep 10, 2026',
    dueDate: 'Sep 15, 2026'
  },
  {
    id: '2',
    title: 'Hydraulic Fluid Filter Replacement',
    description: 'Scheduled 500-hour preventive maintenance filter change.',
    asset: 'Hydraulic Press #1',
    type: 'Preventive',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'John Smith',
    dateCreated: 'Sep 11, 2026',
    dueDate: 'Sep 18, 2026'
  }
];

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    asset: '',
    type: 'Corrective',
    priority: 'Medium',
    assignedTo: '',
    dueDate: ''
  });

  // Load Work Orders from localStorage on mount
  useEffect(() => {
    const savedWOs = localStorage.getItem('cmms_work_orders');
    if (savedWOs) {
      try {
        setWorkOrders(JSON.parse(savedWOs));
      } catch (e) {
        setWorkOrders(initialWorkOrders);
      }
    } else {
      setWorkOrders(initialWorkOrders);
      localStorage.setItem('cmms_work_orders', JSON.stringify(initialWorkOrders));
    }

    // Fetch assets
    fetch('/api/assets').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAssets(data);
    }).catch(err => console.error("Failed to fetch assets", err));
  }, []);

  // Sync to localStorage whenever workOrders change
  const updateWorkOrders = (updatedWOs: WorkOrder[]) => {
    setWorkOrders(updatedWOs);
    localStorage.setItem('cmms_work_orders', JSON.stringify(updatedWOs));
  };

  const openCreateModal = () => {
    setEditMode('create');
    setActiveId(null);
    setFormData({ title: '', description: '', asset: '', type: 'Corrective', priority: 'Medium', assignedTo: '', dueDate: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (wo: WorkOrder) => {
    setEditMode('edit');
    setActiveId(wo.id);
    setFormData({
      title: wo.title,
      description: wo.description,
      asset: wo.asset,
      type: wo.type,
      priority: wo.priority,
      assignedTo: wo.assignedTo,
      dueDate: wo.dueDate
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode === 'edit' && activeId) {
      const updated = workOrders.map(wo => wo.id === activeId ? { ...wo, ...formData } : wo);
      updateWorkOrders(updated);
    } else {
      const newWO: WorkOrder = {
        id: crypto.randomUUID(),
        ...formData,
        status: 'Open',
        dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      updateWorkOrders([newWO, ...workOrders]);
    }
    setIsModalOpen(false);
  };

  const markAsDone = (id: string) => {
    const updated = workOrders.map(wo => wo.id === id ? { ...wo, status: 'Completed' } : wo);
    updateWorkOrders(updated);
  };

  const deleteWorkOrder = (id: string) => {
    if (confirm("Are you sure you want to delete this work order?")) {
      const updated = workOrders.filter(wo => wo.id !== id);
      updateWorkOrders(updated);
    }
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    if (filterStatus === 'All') return true;
    return wo.status === filterStatus;
  });

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-black font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Work Orders</h1>
            <p className="text-gray-500 text-sm">Manage reactive and preventive maintenance tasks</p>
          </div>
          <button onClick={openCreateModal} className="bg-gray-900 text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-800 transition shadow-sm">
            + New Work Order
          </button>
        </div>

        {/* --- FILTER TABS --- */}
        <div className="flex gap-2 mb-6">
          {['All', 'Open', 'In Progress', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === status ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* --- WORK ORDER CARDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkOrders.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
              No work orders found for this status.
            </div>
          ) : (
            filteredWorkOrders.map(wo => (
              <div key={wo.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900 leading-snug">{wo.title}</h3>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      wo.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      wo.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {wo.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                    <p><strong className="text-gray-700">Asset:</strong> {wo.asset || 'General'}</p>
                    <p><strong className="text-gray-700">Assigned:</strong> {wo.assignedTo || 'Unassigned'}</p>
                    <p><strong className="text-gray-700">Priority:</strong> <span className={`font-medium ${wo.priority === 'Critical' || wo.priority === 'High' ? 'text-red-600' : 'text-gray-800'}`}>{wo.priority}</span></p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{wo.description}</p>
                  </div>
                </div>

                {/* --- CARD ACTIONS --- */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(wo)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition">
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteWorkOrder(wo.id)}
                      className="px-2 py-1.5 text-gray-400 hover:text-red-600 rounded text-sm transition">
                      🗑️
                    </button>
                  </div>

                  {wo.status !== 'Completed' ? (
                    <button 
                      onClick={() => markAsDone(wo.id)}
                      className="px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 shadow-sm transition flex items-center gap-1">
                      <span>✓</span> Done
                    </button>
                  ) : (
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">✅ Completed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editMode === 'create' ? 'New Work Order' : 'Edit Work Order'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. Replace hydraulic seal" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Asset *</label>
                  <select required value={formData.asset} onChange={e => setFormData({...formData, asset: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="">-- Select Machine --</option>
                    {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-gray-900">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 resize-none" placeholder="Detailed instructions..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Technician</label>
                  <input type="text" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 shadow-sm">{editMode === 'create' ? 'Create Work Order' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}