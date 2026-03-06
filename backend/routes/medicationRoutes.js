const express = require('express');
const { validateJWT } = require('../middleware/authMiddleware');
const { addMedication, getMedications, deleteMedication } = require('../services/medicationService');

const router = express.Router();

/**
 * POST /api/medications
 * Add medication
 */
router.post('/', validateJWT, async (req, res) => {
  try {
    const { name, dosage, frequency, customInterval, notes } = req.body;

    const result = await addMedication({
      userId: req.userId,
      name,
      dosage,
      frequency,
      customInterval,
      notes
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Add medication error:', error);
    
    if (error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to add medication' });
  }
});

/**
 * GET /api/medications
 * Get all medications for user
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    const medications = await getMedications(req.userId);
    res.json({ medications });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: 'Failed to retrieve medications' });
  }
});

/**
 * DELETE /api/medications/:medicationId
 * Delete medication
 */
router.delete('/:medicationId', validateJWT, async (req, res) => {
  try {
    const { medicationId } = req.params;
    const result = await deleteMedication(medicationId);
    res.json(result);
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

module.exports = router;
