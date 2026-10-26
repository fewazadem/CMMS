"use client";
import React, { useState, useEffect } from 'react';

type Asset = { id: string; name: string; tagNumber?: string; };

// --- MOCK DATA ---
const initialChecklists = [
  { id: 1, title: 'Daily Equipment Safety Check', frequency: 'Daily', asset: '', description: 'General safety inspection completed at the start of every shift', itemsCount: 6, status: 'Never completed', items: ['All emergency stop buttons are accessible and functional', 'Safety guards are in place on all active machines', 'Fire extinguishers are accessible and not expired'] },
  { id: 2, title: 'Daily Hydraulic Press Check', frequency: 'Daily', asset: 'Hydraulic Press #1', description: 'Pre-shift inspection for Hydraulic Press #1', itemsCount: 6, status: 'Never completed', items: ['Hydraulic fluid level within operating range', 'No visible hydraulic leaks on hoses or cylinders', 'Pressure gauge reads within normal range (80-150 bar)'] }
];

const initialMeters = [
  { id: 1, name: 'Compressor Running Hours', asset: 'Air Compressor Unit #1', currentValue: 540, unit: 'hrs', threshold: '540', percent: 100, color: 'bg-red-500', lastReadingDate: 'Sep 6, 2026', lastReadingBy: 'Maria Garcia', alert: true },
  { id: 2, name: 'Run hours', asset: 'CNC Machine #2', currentValue: 2000, unit: 'hours', threshold: '4500', percent: 44, color: 'bg-green-500', lastReadingDate: 'Sep 12, 2026', lastReadingBy: 'Fewaz Adem', alert: false },
  { id: 3, name: 'Hydraulic Oil Hours', asset: 'Hydraulic Press #1', currentValue: 777, unit: 'hrs', threshold: '1000', percent: 78, color: 'bg-yellow-500', lastReadingDate: 'Sep 6, 2026', lastReadingBy: 'John Smith', alert: false },
  { id: 4, name: 'Press Cycle Count', asset: 'Hydraulic Press #1', currentValue: 43364, unit: 'cycles', threshold: '50000', percent: 87, color: 'bg-yellow-500', lastReadingDate: 'Sep 6, 2026', lastReadingBy: 'Tom Lee', alert: false },
  { id: 5, name: 'Program Cycle Count', asset: 'Industrial Lathe #1', currentValue: 9111, unit: 'cycles', threshold: '', percent: 0, color: 'bg-gray-200', lastReadingDate: 'Sep 6, 2026', lastReadingBy: 'Maria Garcia', alert: false }
];

export default function ChecklistsMetersPage() {
  // Main State
  const [activeTab, setActiveTab] = useState<'Checklists' | 'Meters'>('Checklists');
  const [activeChecklistFilter, setActiveChecklistFilter] = useState('All');
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // Data State
  const [checklists, setChecklists] = useState(initialChecklists);
  const [meters, setMeters] = useState(initialMeters);
  
  // Edit State
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [activeEditId, setActiveEditId] = useState<number | null>(null);

  // Modals
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isMeterModalOpen, setIsMeterModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeMeter, setActiveMeter] = useState<any>(null);
  
  // Fill Checklist Modal State
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);
  const [activeFillChecklist, setActiveFillChecklist] = useState<any>(null);
  const [fillState, setFillState] = useState<Record<number, { checked: boolean; note: string }>>({});

  // Forms
  const [checklistForm, setChecklistForm] = useState({ title: '', frequency: 'Daily', asset: '', description: '', items: [''] });
  const [meterForm, setMeterForm] = useState({ name: '', asset: '', unit: '', description: '', threshold: '' });
  const [logForm, setLogForm] = useState({ value: '', user: '', notes: '' });

  useEffect(() => {
    fetch('/api/assets').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setAssets(data);
    }).catch(err => console.error("Failed to fetch assets", err));
  }, []);

  // --- CHECKLIST HANDLERS ---
  const openNewChecklist = () => {
    setEditMode('create');
    setChecklistForm({ title: '', frequency: 'Daily', asset: '', description: '', items: [''] });
    setIsChecklistModalOpen(true);
  };

  const openEditChecklist = (checklist: any) => {
    setEditMode('edit');
    setActiveEditId(checklist.id);
    setChecklistForm({ 
      title: checklist.title, frequency: checklist.frequency, asset: checklist.asset || '', 
      description: checklist.description || '', items: [...checklist.items] 
    });
    setIsChecklistModalOpen(true);
  };

  const handleChecklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode === 'edit' && activeEditId) {
      setChecklists(checklists.map(c => c.id === activeEditId ? { ...c, ...checklistForm, itemsCount: checklistForm.items.length } : c));
    } else {
      const newChecklist = { id: Date.now(), ...checklistForm, itemsCount: checklistForm.items.length, status: 'Pending' };
      setChecklists([newChecklist, ...checklists]);
    }
    setIsChecklistModalOpen(false);
  };

  const deleteChecklist = (id: number) => {
    if (confirm("Are you sure you want to delete this checklist?")) {
      setChecklists(checklists.filter(c => c.id !== id));
    }
  };

  // --- FILL CHECKLIST HANDLERS ---
  const openFillModal = (checklist: any) => {
    setActiveFillChecklist(checklist);
    const initialFillState: Record<number, { checked: boolean, note: string }> = {};
    checklist.items.forEach((_: any, idx: number) => {
      initialFillState[idx] = { checked: false, note: '' };
    });
    setFillState(initialFillState);
    setIsFillModalOpen(true);
  };

  const handleFillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFillChecklist) return;
    
    setChecklists(checklists.map(c => 
      c.id === activeFillChecklist.id ? { ...c, status: `Completed ${new Date().toLocaleDateString()}` } : c
    ));
    setIsFillModalOpen(false);
  };

  // --- METER HANDLERS ---
  const openNewMeter = () => {
    setEditMode('create');
    setMeterForm({ name: '', asset: '', unit: '', description: '', threshold: '' });
    setIsMeterModalOpen(true);
  };

  const openEditMeter = (meter: any) => {
    setEditMode('edit');
    setActiveEditId(meter.id);
    setMeterForm({ 
      name: meter.name, asset: meter.asset, unit: meter.unit, 
      description: meter.description || '', threshold: meter.threshold || '' 
    });
    setIsMeterModalOpen(true);
  };

  const handleMeterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdVal = parseFloat(meterForm.threshold);
    const hasThreshold = !isNaN(thresholdVal) && thresholdVal > 0;

    if (editMode === 'edit' && activeEditId) {
      setMeters(meters.map(m => {
        if (m.id === activeEditId) {
          let newPercent = 0;
          let newColor = 'bg-gray-200';
          let alert = false;
          
          if (hasThreshold) {
            newPercent = Math.min(Math.round((m.currentValue / thresholdVal) * 100), 100);
            if (newPercent < 50) newColor = 'bg-green-500';
            else if (newPercent < 90) newColor = 'bg-yellow-500';
            else { newColor = 'bg-red-500'; alert = true; }
          }
          return { ...m, ...meterForm, percent: newPercent, color: newColor, alert: alert };
        }
        return m;
      }));
    } else {
      const newMeter = { 
        id: Date.now(), ...meterForm, currentValue: 0, percent: 0, color: 'bg-gray-200', 
        lastReadingDate: 'Never', lastReadingBy: '-', alert: false 
      };
      setMeters([newMeter, ...meters]);
    }
    setIsMeterModalOpen(false);
  };

  const openLogModal = (meter: any) => {
    setActiveMeter(meter);
    setLogForm({ value: '', user: '', notes: '' });
    setIsLogModalOpen(true);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeter) return;

    const newValue = parseFloat(logForm.value);
    if (isNaN(newValue)) return;

    const threshold = parseFloat(activeMeter.threshold);
    let newPercent = 0;
    let newColor = 'bg-gray-200';
    let alert = false;

    if (!isNaN(threshold) && threshold > 0) {
      newPercent = Math.min(Math.round((newValue / threshold) * 100), 100);
      if (newPercent < 50) newColor = 'bg-green-500';
      else if (newPercent < 90) newColor = 'bg-yellow-500';
      else { newColor = 'bg-red-500'; alert = true; }
    }

    setMeters(meters.map(m => m.id === activeMeter.id ? {
      ...m,
      currentValue: newValue,
      percent: newPercent,
      color: newColor,
      alert: alert,
      lastReadingDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastReadingBy: logForm.user || 'Eng. Fewaz'
    } : m));

    setIsLogModalOpen(false);
    setLogForm({ value: '', user: '', notes: '' });
  };

  const deleteMeter = (id: number) => {
    if (confirm("Are you sure you want to delete this meter?")) {
      setMeters(meters.filter(m => m.id !== id));
    }
  };

  // Checklist Item Helpers
  const handleAddChecklistItem = () => setChecklistForm({ ...checklistForm, items: [...checklistForm.items, ''] });
  const handleUpdateChecklistItem = (index: number, value: string) => {
    const newItems = [...checklistForm.items];
    newItems[index] = value;
    setChecklistForm({ ...checklistForm, items: newItems });
  };
  const handleRemoveChecklistItem = (index: number) => {
    const newItems = checklistForm.items.filter((_, i) => i !== index);
    setChecklistForm({ ...checklistForm, items: newItems });
  };

  // --- DYNAMIC FILTERING & COUNTS ---
  const completedCount = checklists.filter(c => c.status.includes('Completed')).length;
  const pendingCount = checklists.length - completedCount;

  const filteredChecklists = checklists.filter(c => {
    if (activeChecklistFilter === 'All') return true;
    if (activeChecklistFilter === 'Completed') return c.status.includes('Completed');
    if (activeChecklistFilter === 'Pending') return !c.status.includes('Completed');
    return c.frequency === activeChecklistFilter;
  });

  return (
    <div className="p-8 min-h-screen bg-white text-black font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checklists & Meters</h1>
          <p className="text-gray-500 text-sm">Daily, weekly, biweekly, and monthly checklists — plus asset meter readings</p>
        </div>

        {/* --- MAIN TABS --- */}
        <div className="flex bg-gray-50 p-1 rounded-lg mb-6 w-fit border border-gray-200">
          <button onClick={() => setActiveTab('Checklists')} className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'Checklists' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            <span>☑️</span> Checklists
          </button>
          <button onClick={() => setActiveTab('Meters')} className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'Meters' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            <span>⏱️</span> Meters
          </button>
        </div>

        {/* --- CHECKLISTS VIEW --- */}
        {activeTab === 'Checklists' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              
              {/* Working Filter Tabs */}
              <div className="flex gap-2 text-sm font-medium">
                {['All', 'Pending', 'Completed', 'Daily', 'Weekly', 'Monthly'].map(f => (
                  <button key={f} onClick={() => setActiveChecklistFilter(f)} className={`px-3 py-1.5 rounded-md transition ${activeChecklistFilter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{f}</button>
                ))}
              </div>
              
              {/* Dynamic Counts & Button */}
              <div className="flex items-center gap-3">
                {completedCount > 0 && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{completedCount} Completed</span>}
                {pendingCount > 0 && <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">{pendingCount} Due</span>}
                <button onClick={openNewChecklist} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 shadow-sm ml-2">+ New Checklist</button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredChecklists.map(checklist => (
                <div key={checklist.id} className={`border rounded-xl p-5 bg-white shadow-sm flex justify-between items-start transition-all ${checklist.status.includes('Completed') ? 'border-green-200 bg-green-50/20' : 'border-yellow-300'}`}>
                  <div className="w-2/3">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={checklist.status.includes('Completed') ? 'text-green-500' : 'text-yellow-500'}>
                        {checklist.status.includes('Completed') ? '✅' : '⏱️'}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900">{checklist.title}</h3>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2 py-0.5 rounded">{checklist.frequency}</span>
                      {checklist.asset && <span className="bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold px-2 py-0.5 rounded">{checklist.asset}</span>}
                    </div>
                    <p className="text-sm text-gray-600">{checklist.description}</p>
                    <p className={`text-xs mt-1 font-medium ${checklist.status.includes('Completed') ? 'text-green-600' : 'text-gray-500'}`}>{checklist.itemsCount} items · {checklist.status}</p>
                    <ul className="mt-3 space-y-1">
                      {checklist.items.slice(0, 3).map((item, i) => (
                        <li key={i} className={`text-sm flex items-center gap-2 truncate ${checklist.status.includes('Completed') ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                          <span className="w-1 h-1 bg-gray-400 rounded-full block flex-shrink-0"></span>{item}
                        </li>
                      ))}
                      {checklist.items.length > 3 && <li className="text-sm text-gray-400 italic mt-1">+{checklist.items.length - 3} more...</li>}
                    </ul>
                  </div>
                  <div className="flex items-center gap-4">
                    {!checklist.status.includes('Completed') && (
                      <button onClick={() => openFillModal(checklist)} className="bg-gray-900 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-800 flex items-center gap-2 shadow-sm">
                        <span>☑️</span> Fill Now
                      </button>
                    )}
                    <div className="flex text-gray-400 gap-3 text-lg">
                      <button onClick={() => openEditChecklist(checklist)} className="hover:text-blue-600" title="Edit">✏️</button>
                      <button onClick={() => deleteChecklist(checklist.id)} className="hover:text-red-600" title="Delete">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredChecklists.length === 0 && <p className="text-center text-gray-400 p-8 border rounded-xl border-dashed">No checklists match this filter.</p>}
            </div>
          </div>
        )}

        {/* --- METERS VIEW --- */}
        {activeTab === 'Meters' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <select className="border border-gray-300 rounded-md px-4 py-2 text-sm bg-white outline-none">
                  <option>All Assets</option>
                  {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>
              </div>
              <button onClick={openNewMeter} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 shadow-sm">+ Add Meter</button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500">
                  <tr>
                    <th className="p-4 font-medium">Meter / Asset</th>
                    <th className="p-4 font-medium">Current Value</th>
                    <th className="p-4 font-medium">vs Threshold</th>
                    <th className="p-4 font-medium">Last Reading</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meters.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">No meters found.</td></tr>
                  ) : (
                    meters.map(meter => (
                      <tr key={meter.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">⏱️</span>
                            <p className="font-semibold text-gray-900">{meter.name} {meter.alert && <span className="text-yellow-500">⚠️</span>}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 ml-6">{meter.asset}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-gray-900 text-base">{meter.currentValue.toLocaleString()}</span> <span className="text-gray-500">{meter.unit}</span>
                        </td>
                        <td className="p-4">
                          {meter.threshold ? (
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full ${meter.color} transition-all duration-500`} style={{ width: `${meter.percent}%` }}></div>
                              </div>
                              <span className="text-xs text-gray-500 w-8">{meter.percent}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No threshold</span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-gray-900">{meter.lastReadingDate}</p>
                          <p className="text-xs text-gray-500">{meter.lastReadingBy}</p>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openLogModal(meter)} className="bg-gray-900 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-800 shadow-sm">+ Log</button>
                            <button onClick={() => openEditMeter(meter)} className="text-gray-400 hover:text-blue-600" title="Edit">✏️</button>
                            <button onClick={() => deleteMeter(meter.id)} className="text-gray-400 hover:text-red-600" title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- MODALS --- */}

      {/* FILL CHECKLIST MODAL (New interactive execution view) */}
      {isFillModalOpen && activeFillChecklist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeFillChecklist.title}</h2>
                {activeFillChecklist.asset && <p className="text-sm text-gray-500">{activeFillChecklist.asset}</p>}
              </div>
              <button type="button" onClick={() => setIsFillModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-50/50">
              <form id="fill-form" onSubmit={handleFillSubmit} className="space-y-4">
                {activeFillChecklist.items.map((item: string, index: number) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-all hover:border-blue-300">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition"
                        checked={fillState[index]?.checked || false}
                        onChange={(e) => setFillState({...fillState, [index]: { ...fillState[index], checked: e.target.checked }})}
                      />
                      <div className="flex-1">
                        <span className={`text-base transition-all duration-200 ${fillState[index]?.checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {item}
                        </span>
                        <input 
                          type="text" 
                          className={`mt-2.5 w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all ${fillState[index]?.checked ? 'bg-gray-50 text-gray-500' : 'bg-gray-50/50 text-gray-800 focus:bg-white'}`}
                          placeholder="Note (optional)..." 
                          value={fillState[index]?.note || ''}
                          onChange={(e) => setFillState({...fillState, [index]: { ...fillState[index], note: e.target.value }})}
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-xl shrink-0">
              <button type="button" onClick={() => setIsFillModalOpen(false)} className="px-5 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" form="fill-form" className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition">Submit Checklist</button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Configuration Modal */}
      {isChecklistModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editMode === 'create' ? 'New Checklist' : 'Edit Checklist'}</h2>
              <button onClick={() => setIsChecklistModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleChecklistSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required type="text" value={checklistForm.title} onChange={e => setChecklistForm({...checklistForm, title: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. Daily Safety Check" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={checklistForm.frequency} onChange={e => setChecklistForm({...checklistForm, frequency: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-gray-900">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Per Shift</option>
                    <option>Ad-Hoc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Asset</label>
                  <select value={checklistForm.asset} onChange={e => setChecklistForm({...checklistForm, asset: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="">-- General / Facility --</option>
                    {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={checklistForm.description} onChange={e => setChecklistForm({...checklistForm, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 resize-none" placeholder="What is this checklist for?"></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Checklist Items</label>
                  <button type="button" onClick={handleAddChecklistItem} className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Add item</button>
                </div>
                <div className="space-y-2">
                  {checklistForm.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-4">{index + 1}.</span>
                      <input required type="text" value={item} onChange={e => handleUpdateChecklistItem(index, e.target.value)} className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder={`Item ${index + 1}...`} />
                      <button type="button" onClick={() => handleRemoveChecklistItem(index)} className="text-gray-400 hover:text-red-500 w-6 text-center">🗑️</button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsChecklistModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 shadow-sm">{editMode === 'create' ? 'Create Checklist' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meter Modal */}
      {isMeterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editMode === 'create' ? 'Add Meter' : 'Edit Meter'}</h2>
              <button onClick={() => setIsMeterModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleMeterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meter Name *</label>
                <input required type="text" value={meterForm.name} onChange={e => setMeterForm({...meterForm, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. Spindle Running Hours" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Asset *</label>
                <select required value={meterForm.asset} onChange={e => setMeterForm({...meterForm, asset: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="">-- Select Machine --</option>
                  {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input type="text" value={meterForm.description} onChange={e => setMeterForm({...meterForm, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="What does this meter track?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <input required type="text" value={meterForm.unit} onChange={e => setMeterForm({...meterForm, unit: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. hrs, cycles" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Threshold Value</label>
                  <input type="number" value={meterForm.threshold} onChange={e => setMeterForm({...meterForm, threshold: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g. 2000" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsMeterModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 shadow-sm">{editMode === 'create' ? 'Add Meter' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Meter Reading Modal */}
      {isLogModalOpen && activeMeter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Log Meter Reading</h2>
                <p className="text-sm text-gray-500 mt-1">{activeMeter.asset}</p>
                <p className="text-sm font-medium text-gray-700 mt-3">Current: <span className="font-bold">{activeMeter.currentValue} {activeMeter.unit}</span></p>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleLogSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Reading * ({activeMeter.unit})</label>
                <input required type="number" value={logForm.value} onChange={e => setLogForm({...logForm, value: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="Enter new reading" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recorded By</label>
                <input type="text" value={logForm.user} onChange={e => setLogForm({...logForm, user: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} value={logForm.notes} onChange={e => setLogForm({...logForm, notes: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 resize-none" placeholder="Optional notes..."></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 shadow-sm">Log Reading</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}