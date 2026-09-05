import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string): T[] {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error(`[LocalStore] Failed to read ${filename}:`, err);
    return [];
  }
}

function writeJsonFile<T>(filename: string, data: T[]): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`[LocalStore] Failed to write ${filename}:`, err);
  }
}

export function persistBooking<T extends { id: string }>(booking: T): T {
  const list = readJsonFile<T>('bookings.json');
  list.unshift(booking);
  writeJsonFile('bookings.json', list);
  return booking;
}

export function persistContact<T extends { id: string }>(contact: T): T {
  const list = readJsonFile<T>('contacts.json');
  list.unshift(contact);
  writeJsonFile('contacts.json', list);
  return contact;
}
