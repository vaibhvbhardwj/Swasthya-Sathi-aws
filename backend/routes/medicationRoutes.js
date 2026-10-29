const express = require('express');
const { validateJWT } = require('../middleware/authMiddleware');
const {
  addMedication,
  getMedications,
  deleteMedication,
  markMedicationTaken,
  skipMedication
} = require('../services/medicationService');

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

/**
 * PUT /api/medications/:medicationId/taken
 * Mark medication as taken and schedule the next dose
 */
router.put('/:medicationId/taken', validateJWT, async (req, res) => {
  try {
    const { medicationId } = req.params;
    const result = await markMedicationTaken(medicationId, req.userId);
    res.json(result);
  } catch (error) {
    console.error('Mark medication taken error:', error);
    if (error.message === 'Medication not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to mark medication as taken' });
  }
});

/**
 * PUT /api/medications/:medicationId/skip
 * Skip this dose and schedule the next one
 */
router.put('/:medicationId/skip', validateJWT, async (req, res) => {
  try {
    const { medicationId } = req.params;
    const result = await skipMedication(medicationId, req.userId);
    res.json(result);
  } catch (error) {
    console.error('Skip medication error:', error);
    if (error.message === 'Medication not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to skip medication' });
  }
});

module.exports = router;
