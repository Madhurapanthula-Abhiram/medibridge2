/**
 * /api/illnesses — Static illness data (no database required)
 * The frontend uses local data/illnesses.js; this route exists for external API consumers.
 */
const express = require('express');
const router = express.Router();

// Static illness categories (extend as needed)
const illnessData = [
  { id: '1', name: 'Common Cold', category: 'Respiratory', severity: 'mild', specialty: 'General Physician' },
  { id: '2', name: 'Flu', category: 'Respiratory', severity: 'moderate', specialty: 'General Physician' },
  { id: '3', name: 'Diabetes', category: 'Metabolic', severity: 'chronic', specialty: 'Endocrinologist' },
  { id: '4', name: 'Hypertension', category: 'Cardiac', severity: 'chronic', specialty: 'Cardiologist' },
  { id: '5', name: 'Migraine', category: 'Neurological', severity: 'moderate', specialty: 'Neurologist' },
  { id: '6', name: 'Asthma', category: 'Respiratory', severity: 'chronic', specialty: 'Pulmonologist' },
  { id: '7', name: 'Dengue Fever', category: 'Infectious', severity: 'severe', specialty: 'Infectious Disease' },
  { id: '8', name: 'Typhoid', category: 'Infectious', severity: 'severe', specialty: 'General Physician' },
  { id: '9', name: 'Malaria', category: 'Infectious', severity: 'severe', specialty: 'Infectious Disease' },
  { id: '10', name: 'Arthritis', category: 'Musculoskeletal', severity: 'chronic', specialty: 'Rheumatologist' },
];

router.get('/', (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  let data = [...illnessData];

  if (category) data = data.filter(i => i.category.toLowerCase() === category.toLowerCase());
  if (search) data = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = data.slice(start, start + parseInt(limit));

  res.json({
    illnesses: paginated,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: data.length, pages: Math.ceil(data.length / parseInt(limit)) }
  });
});

router.get('/categories', (req, res) => {
  const categories = [...new Set(illnessData.map(i => i.category))];
  res.json(categories);
});

router.get('/:id', (req, res) => {
  const illness = illnessData.find(i => i.id === req.params.id);
  if (!illness) return res.status(404).json({ message: 'Illness not found' });
  res.json(illness);
});

module.exports = router;
