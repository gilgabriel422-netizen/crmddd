const express = require('express');
const router = express.Router();
const ClientManagement = require('../models/ClientManagement');

// Create a new client management
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const created = await ClientManagement.create(data);
    res.json({ management: created });
  } catch (err) {
    console.error('Error creating client management', err);
    res.status(500).json({ error: 'Error creating client management' });
  }
});

// List client managements (optional filter by client_id)
router.get('/', async (req, res) => {
  try {
    const clientId = req.query.client_id || null;
    const where = clientId ? { client_id: clientId } : {};
    const items = await ClientManagement.findAll({ 
      where,
      order: [['created_at', 'DESC']]
    });
    res.json({ managements: items });
  } catch (err) {
    console.error('Error fetching client managements', err);
    res.status(500).json({ error: 'Error fetching client managements' });
  }
});

module.exports = router;
