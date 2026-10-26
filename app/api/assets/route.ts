import { NextResponse } from 'next/server';

// In-memory array or database mock for API requests
let assetsData = [
  { id: '1', name: 'CNC Machine #2', tagNumber: 'CNC-002', category: 'Machining', status: 'Operational', location: 'Plant Floor A' },
  { id: '2', name: 'Hydraulic Press #1', tagNumber: 'HYD-001', category: 'Pressing', status: 'Maintenance', location: 'Plant Floor B' },
  { id: '3', name: 'Air Compressor Unit #1', tagNumber: 'CMP-001', category: 'Utilities', status: 'Operational', location: 'Utility Room' },
  { id: '4', name: 'Industrial Lathe #1', tagNumber: 'LAT-001', category: 'Machining', status: 'Operational', location: 'Plant Floor A' },
  { id: '5', name: 'Conveyer Belt A', tagNumber: 'CON-001', category: 'Handling', status: 'Offline', location: 'Packaging Line' }
];

export async function GET() {
  return NextResponse.json(assetsData);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAsset = {
      id: crypto.randomUUID(),
      name: body.name || 'Unnamed Asset',
      tagNumber: body.tagNumber || '',
      category: body.category || 'General',
      status: body.status || 'Operational',
      location: body.location || 'Main Plant'
    };
    
    assetsData.push(newAsset);
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}