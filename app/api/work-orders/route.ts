import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import path from 'path';

const workOrders = sqliteTable('work_orders', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  asset: text('asset'),
  type: text('type').notNull().default('Corrective'),
  priority: text('priority').notNull().default('Medium'),
  status: text('status').notNull().default('Open'),
  assignedTo: text('assignedTo'),
  dueDate: text('dueDate'),
  notes: text('notes'),
  dateCreated: text('dateCreated').notNull(),
});

const dbPath = path.join(process.cwd(), 'dev.db');
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

export async function GET() {
  try {
    // 🛑 The DROP TABLE command has been removed! Your data is safe now.
    await client.execute(`
      CREATE TABLE IF NOT EXISTS work_orders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        asset TEXT,
        type TEXT NOT NULL DEFAULT 'Corrective',
        priority TEXT NOT NULL DEFAULT 'Medium',
        status TEXT NOT NULL DEFAULT 'Open',
        assignedTo TEXT,
        dueDate TEXT,
        notes TEXT,
        dateCreated TEXT NOT NULL
      )
    `);

    const allWorkOrders = await db.select().from(workOrders);
    return NextResponse.json(allWorkOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newOrder = await db.insert(workOrders).values(data).returning();
    return NextResponse.json(newOrder[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}