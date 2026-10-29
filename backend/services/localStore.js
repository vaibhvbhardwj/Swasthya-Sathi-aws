const fs = require('fs/promises');
const path = require('path');

const DATA_FILE = process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'local-db.json');

const SAMPLE_DOCTORS = [
  {
    doctorId: 'local-doctor-sarah-johnson',
    name: 'Dr. Sarah Johnson',
    specialization: 'General Physician',
    experienceYears: 10,
    rating: 4.8,
    baseRate: 500,
    verified: true,
    createdAt: '2026-03-01T00:00:00.000Z'
  },
  {
    doctorId: 'local-doctor-rajesh-kumar',
    name: 'Dr. Rajesh Kumar',
    specialization: 'Cardiologist',
    experienceYears: 15,
    rating: 4.9,
    baseRate: 800,
    verified: true,
    createdAt: '2026-03-01T00:00:00.000Z'
  },
  {
    doctorId: 'local-doctor-emily-chen',
    name: 'Dr. Emily Chen',
    specialization: 'Endocrinologist',
    experienceYears: 8,
    rating: 4.7,
    baseRate: 600,
    verified: true,
    createdAt: '2026-03-01T00:00:00.000Z'
  },
  {
    doctorId: 'local-doctor-michael-brown',
    name: 'Dr. Michael Brown',
    specialization: 'Neurologist',
    experienceYears: 12,
    rating: 4.9,
    baseRate: 750,
    verified: true,
    createdAt: '2026-03-01T00:00:00.000Z'
  }
];

const EMPTY_DB = {
  users: [],
  doctors: SAMPLE_DOCTORS,
  consultations: [],
  notifications: [],
  medications: [],
  chatDrafts: [],
  labReports: []
};

let writeQueue = Promise.resolve();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeDb(db) {
  const normalized = { ...EMPTY_DB, ...db };

  for (const key of Object.keys(EMPTY_DB)) {
    if (!Array.isArray(normalized[key])) {
      normalized[key] = clone(EMPTY_DB[key]);
    }
  }

  if (normalized.doctors.length === 0) {
    normalized.doctors = clone(SAMPLE_DOCTORS);
  }

  return normalized;
}

async function ensureDbFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.writeFile(DATA_FILE, JSON.stringify(EMPTY_DB, null, 2));
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return normalizeDb(raw.trim() ? JSON.parse(raw) : {});
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const tmpFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(normalizeDb(db), null, 2));
  await fs.rename(tmpFile, DATA_FILE);
}

async function withDb(mutator) {
  writeQueue = writeQueue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  });

  return writeQueue;
}

async function insert(collection, item) {
  return withDb((db) => {
    db[collection].push(clone(item));
    return clone(item);
  });
}

async function list(collection, predicate = () => true, options = {}) {
  const db = await readDb();
  let items = db[collection].filter(predicate);

  if (options.sortBy) {
    const direction = options.desc === false ? 1 : -1;
    items = items.sort((a, b) => String(a[options.sortBy] || '').localeCompare(String(b[options.sortBy] || '')) * direction);
  }

  if (options.limit) {
    items = items.slice(0, options.limit);
  }

  return clone(items);
}

async function findOne(collection, predicate) {
  const db = await readDb();
  const item = db[collection].find(predicate);
  return item ? clone(item) : null;
}

async function findById(collection, idField, id) {
  return findOne(collection, item => item[idField] === id);
}

async function updateById(collection, idField, id, updates) {
  return withDb((db) => {
    const index = db[collection].findIndex(item => item[idField] === id);
    if (index === -1) {
      return null;
    }

    db[collection][index] = {
      ...db[collection][index],
      ...updates
    };

    return clone(db[collection][index]);
  });
}

async function removeById(collection, idField, id) {
  return withDb((db) => {
    const initialLength = db[collection].length;
    db[collection] = db[collection].filter(item => item[idField] !== id);
    return initialLength !== db[collection].length;
  });
}

async function resetLocalData() {
  await writeDb(clone(EMPTY_DB));
}

module.exports = {
  DATA_FILE,
  SAMPLE_DOCTORS,
  insert,
  list,
  findOne,
  findById,
  updateById,
  removeById,
  resetLocalData
};
