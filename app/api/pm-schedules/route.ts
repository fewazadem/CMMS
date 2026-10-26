import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import path from 'path';

const pmSchedules = sqliteTable('pm_schedules', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  asset: text('asset').notNull(),
  frequency: text('frequency').notNull(), // Daily, Weekly, Monthly, Quarterly, Annually
  nextDueDate: text('nextDueDate').notNull(),
  assignedTo: text('assignedTo'),
  status: text('status').notNull().default('Active'), // Active or Paused
});

const dbPath = path.join(process.cwd(), 'dev.db');
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

export async function GET() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS pm_schedules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        asset TEXT NOT NULL,
        frequency TEXT NOT NULL,
        nextDueDate TEXT NOT NULL,
        assignedTo TEXT,
        status TEXT NOT NULL DEFAULT 'Active'
      )
    `);

    const allSchedules = await db.select().from(pmSchedules);
    return NextResponse.json(allSchedules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newSchedule = await db.insert(pmSchedules).values(data).returning();
    return NextResponse.json(newSchedule[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}