import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import path from 'path';

const checklists = sqliteTable('checklists', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  frequency: text('frequency').notNull(),
  targetAsset: text('target_asset'),
  items: text('items').notNull(),
});

const dbPath = path.join(process.cwd(), 'dev.db');
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

export async function GET() {
  try {
    const allChecklists = await db.select().from(checklists);
    return NextResponse.json(allChecklists);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newChecklist = await db.insert(checklists).values(data).returning();
    return NextResponse.json(newChecklist[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}