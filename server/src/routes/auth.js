const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db/database');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const admin = await db.getAdminByEmail(email);
    if (!admin)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password.' });

    await db.updateAdminLogin(admin._id.toString());

    const token = jwt.sign(
      { id: admin._id.toString(), role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      admin: {
        id:   admin._id.toString(),
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
});

module.exports = router;