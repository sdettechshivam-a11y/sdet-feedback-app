const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db     = require('../db/database');
const auth   = require('../middleware/auth');

router.use(auth);

router.get('/feedback', async (req, res) => {
  try {
    const { page = 1, limit = 15, sort = 'submitted_at', order = 'DESC' } = req.query;
    const result = await db.getFeedback({ page, limit, sort, order });
    res.json({ ...result, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load feedback.' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    res.json(await db.getStats());
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats.' });
  }
});

router.get('/export', async (req, res) => {
  try {
    const rows = await db.getAllFeedback();
    const headers = [
      'ID', 'Full Name', 'Work Email', 'Overall Quality',
      'Testing Scope (1-5)', 'Communication (1-5)', 'Timely Delivery (1-5)',
      'Accuracy & Quality (1-5)', 'Ownership (1-5)', 'Recommendation Score (1-10)',
      'Improvement Area', 'Duplicate', 'Submitted At',
    ];
    const csvRows = rows.map(r => [
      r.id,
      `"${r.full_name}"`,
      r.work_email,
      r.overall_quality,
      r.rating_scope         ?? 'N/A',
      r.rating_communication ?? 'N/A',
      r.rating_delivery      ?? 'N/A',
      r.rating_accuracy      ?? 'N/A',
      r.rating_ownership     ?? 'N/A',
      r.nps_score            ?? 'N/A',
      `"${(r.improvement_area || '').replace(/"/g, '""')}"`,
      r.is_duplicate ? 'Yes' : 'No',
      r.submitted_at,
    ].join(','));
    const csv = [headers.join(','), ...csvRows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sdet_feedback_export.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data.' });
  }
});

router.get('/admins', async (req, res) => {
  if (req.admin.role !== 'superadmin')
    return res.status(403).json({ error: 'Forbidden.' });
  try {
    res.json(await db.getAllAdmins());
  } catch (err) {
    res.status(500).json({ error: 'Failed to load admins.' });
  }
});

router.post('/admins', async (req, res) => {
  if (req.admin.role !== 'superadmin')
    return res.status(403).json({ error: 'Forbidden.' });
  const { name, email, password, role = 'admin' } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });
  try {
    await db.createAdmin({ name, email, password_hash: bcrypt.hashSync(password, 10), role });
    res.status(201).json({ success: true });
  } catch (e) {
    if (e.message === 'EMAIL_EXISTS')
      return res.status(409).json({ error: 'An account with this email already exists.' });
    res.status(500).json({ error: 'Failed to create admin.' });
  }
});

router.delete('/admins/:id', async (req, res) => {
  if (req.admin.role !== 'superadmin')
    return res.status(403).json({ error: 'Forbidden.' });
  if (req.params.id === req.admin.id)
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  try {
    await db.deleteAdmin(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete admin.' });
  }
});

module.exports = router;