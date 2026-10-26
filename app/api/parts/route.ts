import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import path from 'path';

const parts = sqliteTable('parts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  partNumber: text('partNumber'),
  qtyOnHand: integer('qtyOnHand').notNull().default(0),
  minQty: integer('minQty').notNull().default(0),
  location: text('location'),
});

const dbPath = path.join(process.cwd(), 'dev.db');
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

export async function GET() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS parts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        partNumber TEXT,
        qtyOnHand INTEGER NOT NULL DEFAULT 0,
        minQty INTEGER NOT NULL DEFAULT 0,
        location TEXT
      )
    `);

    const allParts = await db.select().from(parts);
    return NextResponse.json(allParts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newPart = await db.insert(parts).values(data).returning();
    return NextResponse.json(newPart[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}