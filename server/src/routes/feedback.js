const router = require('express').Router();
const db     = require('../db/database');

router.post('/', async (req, res) => {
  try {
    const {
      full_name, work_email, overall_quality,
      rating_scope, rating_communication, rating_ownership,
      rating_accuracy, nps_score, improvement_area,
    } = req.body;

    if (!full_name || !full_name.trim())
      return res.status(400).json({ error: 'Full name is required.' });

    if (!work_email || !work_email.trim())
      return res.status(400).json({ error: 'Work email is required.' });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email))
      return res.status(400).json({ error: 'Please enter a valid work email address.' });

    const validQualities = ['Exceptional', 'Above Average', 'Average', 'Below Average'];
    if (!overall_quality || !validQualities.includes(overall_quality))
      return res.status(400).json({ error: 'Please select an overall quality rating.' });

    if (overall_quality !== 'Below Average') {
      // Star ratings (1-5): scope, communication, ownership
      const starRatings = [rating_scope, rating_communication, rating_ownership];
      if (starRatings.some(r => !r || Number(r) < 1 || Number(r) > 5))
        return res.status(400).json({ error: 'All star ratings must be between 1 and 5.' });

      // Innovation score (1-10)
      if (!rating_accuracy || Number(rating_accuracy) < 1 || Number(rating_accuracy) > 10)
        return res.status(400).json({ error: 'Please select an innovation score between 1 and 10.' });

      // Recommendation score (1-10)
      if (!nps_score || Number(nps_score) < 1 || Number(nps_score) > 10)
        return res.status(400).json({ error: 'Please select a recommendation score between 1 and 10.' });
    }

    const { isDuplicate } = await db.submitFeedback(req.body);
    res.status(201).json({ success: true, isDuplicate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
});

module.exports = router;