"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type WorkOrder = {
  id: string;
  title: string;
  status: string;
  priority: string;
  asset: string;
};

type Asset = {
  id: string;
  name: string;
  status?: string;
};

type ActivityLog = {
  id: string;
  timestamp: string;
  action: string;
  asset: string;
  user: string;
  timeMs: number; // used to filter last 24hrs
};

export default function DashboardPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  
  const [hoveredAssetStatus, setHoveredAssetStatus] = useState<string | null>(null);

  useEffect(() => {
    // 1. Load shared work orders
    const savedWOs = JSON.parse(localStorage.getItem('cmms_work_orders') || '[]');
    setWorkOrders(savedWOs);

    // 2. Load shared assets
    const savedAssets = JSON.parse(localStorage.getItem('cmms_assets') || '[]');
    if (savedAssets.length > 0) {
      setAssets(savedAssets);
    } else {
      const defaults = [
        { id: '1', name: 'CNC Machine #2', status: 'Operational' },
        { id: '2', name: 'Hydraulic Press #1', status: 'Maintenance' },
        { id: '3', name: 'Air Compressor Unit #1', status: 'Operational' },
        { id: '4', name: 'Industrial Lathe #1', status: 'Operational' },
        { id: '5', name: 'Conveyer Belt A', status: 'Offline' }
      ];
      setAssets(defaults);
      localStorage.setItem('cmms_assets', JSON.stringify(defaults));
    }

    // 3. Load or initialize Activity Log (filtering last 24 hours)
    const savedLogs = JSON.parse(localStorage.getItem('cmms_activity_logs') || '[]');
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1900); // 24hr filter baseline
    const recentLogs = savedLogs.filter((log: ActivityLog) => log.timeMs > twentyFourHoursAgo);
    
    if (recentLogs.length === 0) {
      // Default initial mock entries if none exist
      const defaultLogs: ActivityLog[] = [
        { id: '1', timestamp: '2 hours ago', action: 'Work Order status changed to Completed', asset: 'CNC Machine #2', user: 'Fewaz Adem', timeMs: Date.now() - 7200000 },
        { id: '2', timestamp: '5 hours ago', action: 'Asset status updated to Maintenance', asset: 'Hydraulic Press #1', user: 'John Smith', timeMs: Date.now() - 18000000 },
        { id: '3', timestamp: '12 hours ago', action: 'New Preventive Maintenance WO generated', asset: 'Air Compressor Unit #1', user: 'System / PM', timeMs: Date.now() - 43200000 }
      ];
      setActivities(defaultLogs);
      localStorage.setItem('cmms_activity_logs', JSON.stringify(defaultLogs));
    } else {
      setActivities(recentLogs);
    }
  }, []);

  // Helper to log system activity
  const logActivity = (actionText: string, assetName: string) => {
    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      timestamp: 'Just now',
      action: actionText,
      asset: assetName || 'General Facility',
      user: 'Eng. Fewaz',
      timeMs: Date.now()
    };
    const updatedLogs = [newLog, ...activities];
    setActivities(updatedLogs);
    localStorage.setItem('cmms_activity_logs', JSON.stringify(updatedLogs));
  };

  // Update Work Order Status directly from Dashboard
  const handleWOStatusChange = (woId: string, newStatus: string) => {
    const targetWO = workOrders.find(wo => wo.id === woId);
    const updatedWOs = workOrders.map(wo => wo.id === woId ? { ...wo, status: newStatus } : wo);
    setWorkOrders(updatedWOs);
    localStorage.setItem('cmms_work_orders', JSON.stringify(updatedWOs));

    if (targetWO) {
      logActivity(`Work Order status updated to "${newStatus}"`, targetWO.asset);
    }
  };

  // Update Asset Status directly from Dashboard
  const handleAssetStatusChange = (assetId: string, newStatus: string) => {
    const targetAsset = assets.find(a => a.id === assetId);
    const updatedAssets = assets.map(a => a.id === assetId ? { ...a, status: newStatus } : a);
    setAssets(updatedAssets);
    localStorage.setItem('cmms_assets', JSON.stringify(updatedAssets));

    if (targetAsset) {
      logActivity(`Asset status updated to "${newStatus}"`, targetAsset.name);
    }
  };

  // --- WORK ORDER METRICS ---
  const totalWOs = workOrders.length || 1; 
  const openWOs = workOrders.filter(wo => wo.status === 'Open');
  const inProgressWOs = workOrders.filter(wo => wo.status === 'In Progress');
  const completedWOs = workOrders.filter(wo => wo.status === 'Completed');

  const openPct = Math.round((openWOs.length / totalWOs) * 100);
  const inProgressPct = Math.round((inProgressWOs.length / totalWOs) * 100);
  const completedPct = Math.round((completedWOs.length / totalWOs) * 100);

  const highPriority = workOrders.filter(wo => wo.priority === 'High' || wo.priority === 'Critical').length;
  const normalPriority = workOrders.length - highPriority;

  // --- ASSET STATUS METRICS ---
  const operationalAssets = assets.filter(a => !a.status || a.status === 'Operational' || a.status === 'Active');
  const maintenanceAssets = assets.filter(a => a.status === 'Maintenance' || a.status === 'Under Maintenance');
  const offlineAssets = assets.filter(a => a.status === 'Offline' || a.status === 'Inactive');

  const totalAssets = assets.length || 1;
  const operationalPct = Math.round((operationalAssets.length / totalAssets) * 100);
  const maintenancePct = Math.round((maintenanceAssets.length / totalAssets) * 100);

  const getInspectedAssets = () => {
    if (hoveredAssetStatus === 'Operational') return operationalAssets;
    if (hoveredAssetStatus === 'Maintenance') return maintenanceAssets;
    if (hoveredAssetStatus === 'Offline') return offlineAssets;
    return [];
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-black font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-8 border-b border-gray-200 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">CMMS Dashboard</h1>
            <p className="text-gray-500 text-sm">Plant overview, asset analytics, and maintenance metrics</p>
          </div>
          <div className="flex gap-3">
            <Link href="/work-orders" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 shadow-sm">
              + Manage Work Orders
            </Link>
          </div>
        </div>

        {/* --- TOP METRICS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Work Orders</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{workOrders.length}</p>
            <p className="text-xs text-gray-400 mt-1">Live from shared state</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Open Tickets</p>
            <p className="text-3xl font-extrabold text-yellow-600 mt-2">{openWOs.length}</p>
            <p className="text-xs text-yellow-600 font-medium mt-1">{openPct}% of total workload</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Operational Assets</p>
            <p className="text-3xl font-extrabold text-green-600 mt-2">{operationalAssets.length}</p>
            <p className="text-xs text-green-600 font-medium mt-1">{operationalPct}% plant health</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Under Maintenance</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">{maintenanceAssets.length}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">Active service units</p>
          </div>
        </div>

        {/* --- CHARTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* 1. Work Order Status & Quick Updater */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Work Order Status</h3>
              <p className="text-xs text-gray-400 mb-4">Update ticket status instantly</p>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-4 my-2">
              <div 
                className="w-32 h-32 rounded-full border-8 border-gray-100 relative flex items-center justify-center shadow-inner"
                style={{
                  background: `conic-gradient(
                    #eab308 0% ${openPct}%, 
                    #3b82f6 ${openPct}% ${openPct + inProgressPct}%, 
                    #22c55e ${openPct + inProgressPct}% 100%
                  )`
                }}
              >
                <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                  <span className="text-lg font-bold text-gray-900">{workOrders.length}</span>
                  <span className="text-[9px] text-gray-500">Total WOs</span>
                </div>
              </div>

              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between items-center p-1.5 rounded bg-yellow-50/50">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-full block"></span>Open</span>
                  <span className="font-bold">{openWOs.length}</span>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded bg-blue-50/50">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full block"></span>In Progress</span>
                  <span className="font-bold">{inProgressWOs.length}</span>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded bg-green-50/50">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full block"></span>Completed</span>
                  <span className="font-bold">{completedWOs.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-700 mb-2">⚡ Quick WO Status Updater:</p>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {workOrders.map(wo => (
                  <div key={wo.id} className="flex items-center justify-between text-xs bg-gray-50 px-2.5 py-1.5 rounded border border-gray-100">
                    <span className="truncate w-32 font-medium text-gray-800" title={wo.title}>{wo.title}</span>
                    <select 
                      value={wo.status}
                      onChange={(e) => handleWOStatusChange(wo.id, e.target.value)}
                      className="border border-gray-300 rounded px-1.5 py-0.5 bg-white text-[11px] font-medium outline-none cursor-pointer"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Asset Status & Quick Asset Status Updater */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between relative">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Asset Status</h3>
              <p className="text-xs text-gray-400 mb-4">Hover to inspect or update machine states</p>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-4 my-2">
              <div 
                className="w-32 h-32 rounded-full border-8 border-gray-100 relative flex items-center justify-center shadow-inner"
                style={{
                  background: `conic-gradient(
                    #22c55e 0% ${operationalPct}%, 
                    #3b82f6 ${operationalPct}% ${operationalPct + maintenancePct}%, 
                    #ef4444 ${operationalPct + maintenancePct}% 100%
                  )`
                }}
              >
                <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                  <span className="text-lg font-bold text-gray-900">{assets.length}</span>
                  <span className="text-[9px] text-gray-500">Total Assets</span>
                </div>
              </div>

              <div className="w-full space-y-2 text-sm">
                <div 
                  className={`flex justify-between items-center p-1.5 rounded transition cursor-pointer ${hoveredAssetStatus === 'Operational' ? 'bg-green-100 font-bold' : 'hover:bg-gray-50'}`}
                  onMouseEnter={() => setHoveredAssetStatus('Operational')}
                  onMouseLeave={() => setHoveredAssetStatus(null)}
                >
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full block"></span>Operational</span>
                  <span className="font-bold">{operationalAssets.length}</span>
                </div>
                <div 
                  className={`flex justify-between items-center p-1.5 rounded transition cursor-pointer ${hoveredAssetStatus === 'Maintenance' ? 'bg-blue-100 font-bold' : 'hover:bg-gray-50'}`}
                  onMouseEnter={() => setHoveredAssetStatus('Maintenance')}
                  onMouseLeave={() => setHoveredAssetStatus(null)}
                >
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full block"></span>Maintenance</span>
                  <span className="font-bold">{maintenanceAssets.length}</span>
                </div>
                <div 
                  className={`flex justify-between items-center p-1.5 rounded transition cursor-pointer ${hoveredAssetStatus === 'Offline' ? 'bg-red-100 font-bold' : 'hover:bg-gray-50'}`}
                  onMouseEnter={() => setHoveredAssetStatus('Offline')}
                  onMouseLeave={() => setHoveredAssetStatus(null)}
                >
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full block"></span>Offline</span>
                  <span className="font-bold">{offlineAssets.length}</span>
                </div>
              </div>
            </div>

            {/* Hover Tooltip listing exact machines */}
            {hoveredAssetStatus && (
              <div className="absolute inset-x-4 top-36 bg-gray-900 text-white p-3 rounded-lg shadow-xl text-xs z-20">
                <p className="font-bold text-gray-300 mb-1 border-b border-gray-700 pb-1">
                  {hoveredAssetStatus} Machines:
                </p>
                {getInspectedAssets().length === 0 ? (
                  <p className="text-gray-400 italic py-1">No machines in this state.</p>
                ) : (
                  <ul className="space-y-1 mt-1">
                    {getInspectedAssets().map(m => (
                      <li key={m.id} className="flex items-center gap-1.5 text-gray-200">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> {m.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-700 mb-2">⚡ Quick Asset Status Updater:</p>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {assets.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between text-xs bg-gray-50 px-2.5 py-1.5 rounded border border-gray-100">
                    <span className="truncate w-32 font-medium text-gray-800" title={asset.name}>{asset.name}</span>
                    <select 
                      value={asset.status || 'Operational'}
                      onChange={(e) => handleAssetStatusChange(asset.id, e.target.value)}
                      className="border border-gray-300 rounded px-1.5 py-0.5 bg-white text-[11px] font-medium outline-none cursor-pointer"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 3. Task Priority Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Task Priority Breakdown</h3>
            
            <div className="space-y-6 my-auto">
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-700">High / Critical Priority</span>
                  <span className="text-red-600 font-bold">{highPriority}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${workOrders.length ? (highPriority / workOrders.length) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-700">Normal Priority</span>
                  <span className="text-gray-900 font-bold">{normalPriority}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${workOrders.length ? (normalPriority / workOrders.length) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-500">System Mode:</span>
                <span className="font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">Shared Sync Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* --- SYSTEM ACTIVITY FEED (LAST 24 HOURS) --- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900">System Activity Feed (Last 24 Hours)</h3>
              <p className="text-xs text-gray-500">Live audit log tracking all updates, changes, user actions, and impacted assets</p>
            </div>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full">
              {activities.length} Recent Events
            </span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No recorded activity in the last 24 hours.</p>
            ) : (
              activities.map(log => (
                <div key={log.id} className="flex items-center justify-between text-sm bg-gray-50 hover:bg-gray-100/80 transition p-3 rounded-lg border border-gray-200/60">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🕒</span>
                    <div>
                      <p className="font-semibold text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Target Asset: <strong className="text-gray-700">{log.asset}</strong> · Triggered by: <span className="text-blue-600 font-medium">{log.user}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded shadow-2xs">
                    {log.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- QUICK NAVIGATION CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/work-orders" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-400 transition block">
            <h3 className="font-bold text-lg text-gray-900 mb-1">📋 Work Orders</h3>
            <p className="text-sm text-gray-500">View, assign, and close maintenance tickets.</p>
          </Link>
          <Link href="/pm-schedules" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-400 transition block">
            <h3 className="font-bold text-lg text-gray-900 mb-1">⏱️ PM Schedules</h3>
            <p className="text-sm text-gray-500">Manage preventive maintenance and generate WOs.</p>
          </Link>
          <Link href="/checklists-meters" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-400 transition block">
            <h3 className="font-bold text-lg text-gray-900 mb-1">☑️ Checklists & Meters</h3>
            <p className="text-sm text-gray-500">Log equipment meter readings and shift safety checks.</p>
          </Link>
          <Link href="/assets" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-400 transition block">
            <h3 className="font-bold text-lg text-gray-900 mb-1">🏭 Assets</h3>
            <p className="text-sm text-gray-500">Browse plant machinery, parts, and lifecycle history.</p>
          </Link>
        </div>

      </div>
    </div>
  );
}