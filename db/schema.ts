import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  tag: text('tag').unique().notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  status: text('status').default('Active').notNull(),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  serialNumber: text('serial_number'),
  purchaseDate: text('purchase_date'),
  purchaseCost: real('purchase_cost'),
  openWOs: integer('open_wos').default(0).notNull(),
});

export const parts = sqliteTable('parts', {
  id: text('id').primaryKey(),
  tag: text('tag').unique().notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  qtyOnHand: integer('qty_on_hand').notNull(),
  minQty: integer('min_qty').notNull(),
  unitCost: real('unit_cost').notNull(),
  location: text('location').notNull(),
});

export const checklists = sqliteTable('checklists', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  frequency: text('frequency').notNull(),
  targetAsset: text('target_asset'),
  items: text('items').notNull(),
});

export const operators = sqliteTable('operators', {
  id: text('id').primaryKey(),
  badgeId: text('badge_id').unique().notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  shift: text('shift').notNull(),
});