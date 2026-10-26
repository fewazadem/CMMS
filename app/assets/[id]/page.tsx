"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- TYPES ---
type Asset = { id: string; name: string; status: string; manufacturer?: string; location?: string; category?: string; serialNumber?: string; purchaseDate?: string; purchaseCost?: string; tagNumber?: string; };
type Part = { id: string; name: string; partNumber: string; qtyOnHand: number; minQty: number; location: string; category?: string; supplier?: string; notes?: string; description?: string; unitCost?: number };
type WorkOrder = { id: string; title: string; type: string; status: string; dateCreated: string; assignedTo: string; };
type Note = { id: number; text: string; date: string; user: string };
type SOP = { id: number; title: string; category: string; version: string; author: string; description: string; steps: string };
type Operator = { id: number; name: string; operatorId: string; shift: string; role: string };
type Meter = { id: number; name: string; unit: string; description: string; threshold: string; currentValue: number };
type Report = { id: number; name: string; size: string; date: string };

export default function AssetDetailsPage() {
  const params = useParams();
  const assetId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState('Parts');
  
  // --- STATE ---
  const [workHistory, setWorkHistory] = useState<WorkOrder[]>([]);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [linkedParts, setLinkedParts] = useState<Part[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [reports, setReports] = useState<Report[]>([]); // New Reports state
  
  const [noteInput, setNoteInput] = useState('');

  // Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [isMeterModalOpen, setIsMeterModalOpen] = useState(false);
  
  const [selectedPartId, setSelectedPartId] = useState('');
  
  // Forms
  const [newPartForm, setNewPartForm] = useState({ name: '', partNumber: '', category: '', description: '', qtyOnHand: 0, minQty: 0, unitCost: 0, location: '', supplier: '' });
  const [sopForm, setSopForm] = useState({ title: '', category: 'General', version: '1.0', author: '', description: '', steps: '' });
  const [operatorForm, setOperatorForm] = useState({ name: '', operatorId: '', shift: 'Day Shift (08:00 - 16:00)', role: '' });
  const [meterForm, setMeterForm] = useState({ name: '', unit: '', description: '', threshold: '' });

  // --- FETCH DATA ---
  useEffect(() => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const currentAsset = data.find(a => a.id === assetId);
          setAsset(currentAsset || null);
          if (currentAsset) {
            fetch('/api/work-orders').then(res => res.json()).then(woData => {
                if (Array.isArray(woData)) setWorkHistory(woData.filter(wo => wo.asset === currentAsset.name));
            });
            fetch('/api/parts').then(res => res.json()).then(partsData => {
                if (Array.isArray(partsData)) setAvailableParts(partsData);
            });
          }
        }
      });
  }, [assetId]);

  // --- HANDLERS ---
  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    setNotes([{ id: Date.now(), text: noteInput, date: new Date().toLocaleString(), user: 'Eng. Fewaz S Adem' }, ...notes]);
    setNoteInput('');
  };

  const handleLinkPart = (e: React.FormEvent) => {
    e.preventDefault();
    const partToLink = availableParts.find(p => p.id === selectedPartId);
    if (partToLink && !linkedParts.some(p => p.id === partToLink.id)) setLinkedParts([...linkedParts, partToLink]);
    setIsLinkModalOpen(false);
    setSelectedPartId('');
  };

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempPart = { id: crypto.randomUUID(), ...newPartForm };
    setAvailableParts([...availableParts, tempPart as Part]);
    setLinkedParts([...linkedParts, tempPart as Part]);
    setIsCreateModalOpen(false);
    setNewPartForm({ name: '', partNumber: '', category: '', description: '', qtyOnHand: 0, minQty: 0, unitCost: 0, location: '', supplier: '' });
  };

  const handleAddSOP = (e: React.FormEvent) => {
    e.preventDefault();
    setSops([...sops, { id: Date.now(), ...sopForm }]);
    setIsSopModalOpen(false);
    setSopForm({ title: '', category: 'General', version: '1.0', author: '', description: '', steps: '' });
  };

  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    setOperators([...operators, { id: Date.now(), ...operatorForm }]);
    setIsOperatorModalOpen(false);
    setOperatorForm({ name: '', operatorId: '', shift: 'Day Shift (08:00 - 16:00)', role: '' });
  };

  const handleAddMeter = (e: React.FormEvent) => {
    e.preventDefault();
    setMeters([...meters, { id: Date.now(), currentValue: 0, ...meterForm }]);
    setIsMeterModalOpen(false);
    setMeterForm({ name: '', unit: '', description: '', threshold: '' });
  };

  // Simulate file upload for Reports
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newReport = { id: Date.now(), name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', date: new Date().toLocaleDateString() };
      setReports([...reports, newReport]);
    }
  };

  if (!asset) return <div className="p-8 text-center text-gray-500">Loading asset...</div>;

  const tabs = ['Parts', 'Notes', 'Reports', 'SOPs', 'Operators', 'Meters', 'Work History', 'PM Schedules'];
  const dayShiftOperators = operators.filter(o => o.shift.includes('Day'));
  const nightShiftOperators = operators.filter(o => o.shift.includes('Night'));

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <Link href="/assets" className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-6 text-sm font-medium transition">
          <span>&larr;</span> Back to Assets
        </Link>
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
            <span className={`px-2.5 py-1 text-xs font-bold rounded ${asset.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{asset.status || 'Active'}</span>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 transition">Edit Asset</button>
        </div>

        <div className="flex gap-6 text-sm text-gray-600 mb-8 font-medium">
          <div className="flex items-center gap-1.5"><span className="text-gray-400">🏷️</span> {asset.tagNumber || 'DP'}</div>
          <div className="flex items-center gap-1.5"><span className="text-gray-400">📍</span> {asset.location || 'Hall 5'}</div>
          <div className="flex items-center gap-1.5"><span className="text-gray-400">🔧</span> {asset.category || 'Press'}</div>
        </div>

        {/* Tabs Row */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto border border-gray-200">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'}`}>
              {tab === 'Parts' && <span className="mr-1">📦</span>}
              {tab === 'Work History' && <span className="mr-1">📋</span>}
              {tab}
              {tab === 'Parts' && <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full ml-1">{linkedParts.length}</span>}
              {tab === 'Reports' && <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full ml-1">{reports.length}</span>}
              {tab === 'SOPs' && <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full ml-1">{sops.length}</span>}
              {tab === 'Operators' && <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full ml-1">{operators.length}</span>}
              {tab === 'Meters' && <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full ml-1">{meters.length}</span>}
            </button>
          ))}
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex justify-end gap-3 mb-4">
          {activeTab === 'Parts' && (
            <>
              <button onClick={() => setIsLinkModalOpen(true)} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50">+ Link Existing Part</button>
              <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-gray-900 text-white rounded-md shadow-sm text-sm font-medium hover:bg-gray-800">+ Create Part</button>
            </>
          )}
          {activeTab === 'SOPs' && <button onClick={() => setIsSopModalOpen(true)} className="px-4 py-2 bg-gray-900 text-white rounded-md shadow-sm text-sm font-medium">+ New SOP</button>}
          {activeTab === 'Operators' && <button onClick={() => setIsOperatorModalOpen(true)} className="px-4 py-2 bg-gray-900 text-white rounded-md shadow-sm text-sm font-medium">+ Add Operator</button>}
          {activeTab === 'Meters' && <button onClick={() => setIsMeterModalOpen(true)} className="px-4 py-2 bg-gray-900 text-white rounded-md shadow-sm text-sm font-medium">+ Add Meter</button>}
          {activeTab === 'Work History' && <Link href="/work-orders" className="px-4 py-2 bg-gray-900 text-white rounded-md shadow-sm text-sm font-medium">+ Create Work Order</Link>}
        </div>

        {/* --- TAB CONTENTS --- */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[300px]">
          
          {/* PARTS */}
          {activeTab === 'Parts' && (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500">
                <tr><th className="p-4 font-medium">Part Name</th><th className="p-4 font-medium">Part Number</th><th className="p-4 font-medium text-right">Qty Available</th></tr>
              </thead>
              <tbody>
                {linkedParts.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-400">No parts linked.</td></tr>
                ) : (
                  linkedParts.map(part => (
                    <tr key={part.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 font-semibold text-gray-900">{part.name}</td>
                      <td className="p-4 text-gray-500">{part.partNumber || '—'}</td>
                      <td className="p-4 text-right font-bold text-gray-900">{part.qtyOnHand}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* REPORTS */}
          {activeTab === 'Reports' && (
            <div className="p-6">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 mb-6 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Upload a Report</h3>
                <p className="text-gray-500 text-sm">Click here to browse your computer.</p>
              </div>
              
              {reports.length > 0 && (
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500">
                    <tr><th className="p-4 font-medium">File Name</th><th className="p-4 font-medium">Size</th><th className="p-4 font-medium">Date Added</th></tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-4 font-medium text-blue-600 hover:underline cursor-pointer">{report.name}</td>
                        <td className="p-4 text-gray-500">{report.size}</td>
                        <td className="p-4 text-gray-500">{report.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* SOPs */}
          {activeTab === 'SOPs' && (
            <div className="p-6">
              {sops.length === 0 ? <p className="text-center text-gray-400 py-8">No SOPs found. Click '+ New SOP' to add one.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sops.map(sop => (
                    <div key={sop.id} className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{sop.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">v{sop.version}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">Author: {sop.author} • Category: {sop.category}</p>
                      <p className="text-sm text-gray-700 mb-4">{sop.description}</p>
                      <button className="text-blue-600 text-sm font-medium hover:underline">Read Procedure &rarr;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OPERATORS */}
          {activeTab === 'Operators' && (
            <div className="p-6 bg-gray-50 min-h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50/50 border border-yellow-200 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-yellow-900 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Day Shift</h3>
                      <p className="text-xs text-yellow-700 mt-1">08:00 – 16:00</p>
                    </div>
                    <span className="text-sm text-yellow-800 font-medium">{dayShiftOperators.length} operators</span>
                  </div>
                  <div className="space-y-3">
                    {dayShiftOperators.length === 0 ? <div className="text-center py-6 text-yellow-600 text-sm italic">No operators assigned</div> : (
                      dayShiftOperators.map(op => (
                        <div key={op.id} className="bg-white border border-yellow-200 p-3 rounded-lg flex justify-between items-center shadow-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{op.name}</p>
                            <p className="text-xs text-gray-500 mt-1"><span className="bg-gray-100 px-1.5 py-0.5 rounded mr-1">{op.operatorId}</span> {op.role}</p>
                          </div>
                          <div className="flex gap-3 text-gray-400"><button className="hover:text-blue-600">✏️</button><button className="hover:text-red-600">🗑️</button></div>
                        </div>
                      ))
                    )}
                    <button onClick={() => setIsOperatorModalOpen(true)} className="w-full py-2 border border-dashed border-yellow-300 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-100 transition">+ Add to Day Shift</button>
                  </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-indigo-900 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-400"></span> Night Shift</h3>
                      <p className="text-xs text-indigo-700 mt-1">20:00 – 04:00</p>
                    </div>
                    <span className="text-sm text-indigo-800 font-medium">{nightShiftOperators.length} operators</span>
                  </div>
                  <div className="space-y-3">
                    {nightShiftOperators.length === 0 ? <div className="text-center py-6 text-indigo-600 text-sm italic">No operators assigned</div> : (
                      nightShiftOperators.map(op => (
                        <div key={op.id} className="bg-white border border-indigo-200 p-3 rounded-lg flex justify-between items-center shadow-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{op.name}</p>
                            <p className="text-xs text-gray-500 mt-1"><span className="bg-gray-100 px-1.5 py-0.5 rounded mr-1">{op.operatorId}</span> {op.role}</p>
                          </div>
                          <div className="flex gap-3 text-gray-400"><button className="hover:text-blue-600">✏️</button><button className="hover:text-red-600">🗑️</button></div>
                        </div>
                      ))
                    )}
                    <button onClick={() => setIsOperatorModalOpen(true)} className="w-full py-2 border border-dashed border-indigo-300 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">+ Add to Night Shift</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* METERS */}
          {activeTab === 'Meters' && (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500">
                <tr><th className="p-4 font-medium">Meter Name</th><th className="p-4 font-medium">Reading</th><th className="p-4 font-medium">Unit</th><th className="p-4 font-medium">Threshold</th></tr>
              </thead>
              <tbody>
                {meters.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">No meters set up. Click '+ Add Meter' to begin tracking.</td></tr>
                ) : (
                  meters.map(meter => (
                    <tr key={meter.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 font-semibold text-gray-900">{meter.name} <div className="text-xs font-normal text-gray-500 mt-1">{meter.description}</div></td>
                      <td className="p-4 font-bold text-gray-900 text-lg">{meter.currentValue}</td>
                      <td className="p-4 text-gray-600">{meter.unit}</td>
                      <td className="p-4 text-gray-500">{meter.threshold || 'None'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* NOTES */}
          {activeTab === 'Notes' && (
            <div className="p-6">
              <div className="flex gap-4 mb-8 border-b border-gray-200 pb-6">
                <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2} placeholder="Type a new operational note..." />
                <button onClick={handleAddNote} className="bg-blue-600 text-white px-5 py-2 rounded-md h-fit font-medium hover:bg-blue-700 shadow-sm">Save Note</button>
              </div>
              <div className="space-y-4">
                {notes.map(note => (
                  <div key={note.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p><div className="flex gap-4 mt-3 text-xs text-gray-500 font-medium"><span>👤 {note.user}</span><span>🕒 {note.date}</span></div></div>
                ))}
              </div>
            </div>
          )}

          {/* WORK HISTORY */}
          {activeTab === 'Work History' && (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500">
                <tr><th className="p-4 font-medium">Ticket ID</th><th className="p-4 font-medium">Task</th><th className="p-4 font-medium">Status</th></tr>
              </thead>
              <tbody>
                {workHistory.map((wo, i) => (
                  <tr key={i} className="border-b border-gray-100"><td className="p-4 font-mono font-medium">WO-{wo.id.split('-')[0].toUpperCase()}</td><td className="p-4 font-semibold">{wo.title}</td><td className="p-4">{wo.status}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Parts Modal (Create) - UPDATED TO MATCH SCREENSHOT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create & Link New Part</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleCreatePart} className="space-y-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Part Details</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Name *</label>
                <input required type="text" value={newPartForm.name} onChange={e => setNewPartForm({...newPartForm, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Bearing 6205-2RS" />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                  <input type="text" value={newPartForm.partNumber} onChange={e => setNewPartForm({...newPartForm, partNumber: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. BRG-6205" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={newPartForm.category} onChange={e => setNewPartForm({...newPartForm, category: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition">
                    <option value="">Select...</option>
                    <option>Bearings</option>
                    <option>Belts</option>
                    <option>Filters</option>
                    <option>Seals</option>
                    <option>Lubricants</option>
                    <option>Pneumatics</option>
                    <option>Electrical</option>
                    <option>Tooling</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={newPartForm.description} onChange={e => setNewPartForm({...newPartForm, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Part description..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qty on Hand</label>
                  <input type="number" value={newPartForm.qtyOnHand} onChange={e => setNewPartForm({...newPartForm, qtyOnHand: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Qty (Reorder Point)</label>
                  <input type="number" value={newPartForm.minQty} onChange={e => setNewPartForm({...newPartForm, minQty: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost ($)</label>
                  <input type="number" step="0.01" value={newPartForm.unitCost} onChange={e => setNewPartForm({...newPartForm, unitCost: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                  <input type="text" value={newPartForm.location} onChange={e => setNewPartForm({...newPartForm, location: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Shelf A1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input type="text" value={newPartForm.supplier} onChange={e => setNewPartForm({...newPartForm, supplier: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Industrial Supply Co." />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md font-medium shadow-sm hover:bg-blue-700">Save Part</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Other Modals (Same as before) */}
      {isSopModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">New SOP</h2>
            <form onSubmit={handleAddSOP} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input required type="text" value={sopForm.title} onChange={e => setSopForm({...sopForm, title: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. Startup Procedure" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={sopForm.category} onChange={e => setSopForm({...sopForm, category: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 bg-white"><option>General</option><option>Safety</option><option>Maintenance</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Version</label><input type="text" value={sopForm.version} onChange={e => setSopForm({...sopForm, version: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Author</label><input type="text" value={sopForm.author} onChange={e => setSopForm({...sopForm, author: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Your name" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description / Overview</label><textarea rows={2} value={sopForm.description} onChange={e => setSopForm({...sopForm, description: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Brief overview of this procedure..."></textarea></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Steps <span className="text-gray-400 font-normal">(one step per line)</span></label><textarea rows={4} value={sopForm.steps} onChange={e => setSopForm({...sopForm, steps: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm" placeholder="1. First step&#10;2. Second step"></textarea></div>
              <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setIsSopModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">Save SOP</button></div>
            </form>
          </div>
        </div>
      )}

      {isOperatorModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Add Operator</h2>
            <form onSubmit={handleAddOperator} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Operator Name *</label><input required type="text" value={operatorForm.name} onChange={e => setOperatorForm({...operatorForm, name: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. Ahmed Al-Rashid" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Operator Number / ID</label><input type="text" value={operatorForm.operatorId} onChange={e => setOperatorForm({...operatorForm, operatorId: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. OP-001" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Shift</label><select value={operatorForm.shift} onChange={e => setOperatorForm({...operatorForm, shift: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 bg-white"><option>Day Shift (08:00 - 16:00)</option><option>Night Shift (20:00 - 04:00)</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select value={operatorForm.role} onChange={e => setOperatorForm({...operatorForm, role: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 bg-white"><option value="">Select role...</option><option>Operator</option><option>Senior Operator</option><option>Lead Operator</option><option>Supervisor</option><option>Trainee</option></select></div>
              <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setIsOperatorModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">Add Operator</button></div>
            </form>
          </div>
        </div>
      )}

      {isMeterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Add Meter</h2>
            <form onSubmit={handleAddMeter} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Meter Name *</label><input required type="text" value={meterForm.name} onChange={e => setMeterForm({...meterForm, name: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. Spindle Running Hours" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label><input required type="text" value={meterForm.unit} onChange={e => setMeterForm({...meterForm, unit: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. hrs, cycles, km" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" value={meterForm.description} onChange={e => setMeterForm({...meterForm, description: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="What does this meter track?" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Threshold Value <span className="text-gray-400 font-normal">(optional)</span></label><input type="number" value={meterForm.threshold} onChange={e => setMeterForm({...meterForm, threshold: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. 2000" /></div>
              <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setIsMeterModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-gray-600 rounded-md">Add Meter</button></div>
            </form>
          </div>
        </div>
      )}

      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Link Existing Part</h2>
            <form onSubmit={handleLinkPart}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select from Global Inventory</label>
              <select required value={selectedPartId} onChange={e => setSelectedPartId(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white mb-6">
                <option value="">-- Choose a Part --</option>
                {availableParts.map(p => <option key={p.id} value={p.id}>{p.name} - [Qty: {p.qtyOnHand}]</option>)}
              </select>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">Link Part</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}