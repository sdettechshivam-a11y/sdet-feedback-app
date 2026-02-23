const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
let client;
let db;

async function connect() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('sdet_feedback');
  await seedAdmin();
  return db;
}

async function getDb() {
  return db || await connect();
}

async function seedAdmin() {
  const admins = db.collection('admins');
  const count = await admins.countDocuments();
  if (count === 0) {
    await admins.insertOne({
      name: 'Super Admin',
      email: 'admin@sdettech.com',
      password_hash: bcrypt.hashSync('Admin@SDET2024', 10),
      role: 'superadmin',
      created_at: new Date().toISOString(),
      last_login: null,
    });
    console.log('Default admin created: admin@sdettech.com / Admin@SDET2024');
  }
}

async function getAdminByEmail(email) {
  const db = await getDb();
  return db.collection('admins').findOne({ email: email.toLowerCase().trim() });
}

async function getAdminById(id) {
  const db = await getDb();
  return db.collection('admins').findOne({ _id: new ObjectId(id) });
}

async function getAllAdmins() {
  const db = await getDb();
  const admins = await db.collection('admins')
    .find({}, { projection: { password_hash: 0 } })
    .sort({ created_at: 1 })
    .toArray();
  return admins.map(a => ({ ...a, id: a._id.toString() }));
}

async function createAdmin({ name, email, password_hash, role }) {
  const db = await getDb();
  const exists = await db.collection('admins').findOne({ email: email.toLowerCase().trim() });
  if (exists) throw new Error('EMAIL_EXISTS');
  const result = await db.collection('admins').insertOne({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password_hash,
    role: role || 'admin',
    created_at: new Date().toISOString(),
    last_login: null,
  });
  return { id: result.insertedId.toString() };
}

async function deleteAdmin(id) {
  const db = await getDb();
  await db.collection('admins').deleteOne({ _id: new ObjectId(id) });
}

async function updateAdminLogin(id) {
  const db = await getDb();
  await db.collection('admins').updateOne(
    { _id: new ObjectId(id) },
    { $set: { last_login: new Date().toISOString() } }
  );
}

async function submitFeedback(fields) {
  const db = await getDb();
  const email = fields.work_email.toLowerCase().trim();
  const existing = await db.collection('feedback').findOne({ work_email: email });
  const isDuplicate = !!existing;
  const isBelow = fields.overall_quality === 'Below Average';

  const entry = {
    full_name:            fields.full_name.trim(),
    work_email:           email,
    overall_quality:      fields.overall_quality,
    rating_scope:         isBelow ? null : Number(fields.rating_scope),
    rating_communication: isBelow ? null : Number(fields.rating_communication),
    rating_delivery:      isBelow ? null : Number(fields.rating_delivery),
    rating_accuracy:      isBelow ? null : Number(fields.rating_accuracy),
    rating_ownership:     isBelow ? null : Number(fields.rating_ownership),
    nps_score:            isBelow ? null : Number(fields.nps_score),
    improvement_area:     fields.improvement_area ? fields.improvement_area.trim() : null,
    is_duplicate:         isDuplicate,
    submitted_at:         new Date().toISOString(),
  };

  const result = await db.collection('feedback').insertOne(entry);
  return { entry: { ...entry, id: result.insertedId.toString() }, isDuplicate };
}

async function getFeedback({ page = 1, limit = 15, sort = 'submitted_at', order = 'DESC' } = {}) {
  const db = await getDb();
  const sortDir = order === 'ASC' ? 1 : -1;
  const total = await db.collection('feedback').countDocuments();
  const offset = (Number(page) - 1) * Number(limit);
  const data = await db.collection('feedback')
    .find({})
    .sort({ [sort]: sortDir })
    .skip(offset)
    .limit(Number(limit))
    .toArray();
  return {
    data: data.map(r => ({ ...r, id: r._id.toString() })),
    total,
  };
}

async function getAllFeedback() {
  const db = await getDb();
  const rows = await db.collection('feedback')
    .find({})
    .sort({ submitted_at: -1 })
    .toArray();
  return rows.map(r => ({ ...r, id: r._id.toString() }));
}

async function getStats() {
  const db = await getDb();
  const rows = await db.collection('feedback').find({}).toArray();
  if (!rows.length) return {
    total: 0, duplicates: 0, below_average_count: 0,
    avg_scope: null, avg_communication: null, avg_delivery: null,
    avg_accuracy: null, avg_ownership: null, avg_nps: null, avg_overall: null,
  };

  const fullRows = rows.filter(r => r.overall_quality !== 'Below Average');

  const avg = (arr, key) => {
    const valid = arr.filter(r => r[key] != null);
    if (!valid.length) return null;
    return Math.round((valid.reduce((s, r) => s + r[key], 0) / valid.length) * 100) / 100;
  };

  const avgOverall = fullRows.length
    ? Math.round(
        fullRows.reduce((s, r) =>
          s + ((r.rating_scope + r.rating_communication + r.rating_delivery +
                r.rating_accuracy + r.rating_ownership) / 5), 0
        ) / fullRows.length * 100
      ) / 100
    : null;

  return {
    total:               rows.length,
    duplicates:          rows.filter(r => r.is_duplicate).length,
    below_average_count: rows.filter(r => r.overall_quality === 'Below Average').length,
    avg_scope:           avg(fullRows, 'rating_scope'),
    avg_communication:   avg(fullRows, 'rating_communication'),
    avg_delivery:        avg(fullRows, 'rating_delivery'),
    avg_accuracy:        avg(fullRows, 'rating_accuracy'),
    avg_ownership:       avg(fullRows, 'rating_ownership'),
    avg_nps:             avg(fullRows, 'nps_score'),
    avg_overall:         avgOverall,
  };
}

module.exports = {
  getAdminByEmail, getAdminById, getAllAdmins,
  createAdmin, deleteAdmin, updateAdminLogin,
  submitFeedback, getFeedback, getAllFeedback, getStats,
};