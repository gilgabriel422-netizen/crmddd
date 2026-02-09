const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TRANSFERS_FILE = path.join(DATA_DIR, 'client_transfers.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }
}

async function readTransfers() {
  try {
    const content = await fs.readFile(TRANSFERS_FILE, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    return [];
  }
}

async function writeTransfers(list) {
  await ensureDataDir();
  await fs.writeFile(TRANSFERS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

exports.createTransfer = async (req, res) => {
  try {
    const { clientId, fromUserId, toUserId, reason, metadata } = req.body || {};
    if (!clientId || !toUserId) {
      return res.status(400).json({ error: 'clientId and toUserId are required' });
    }

    const transfer = {
      id: Date.now(),
      clientId,
      fromUserId: fromUserId || null,
      toUserId,
      reason: reason || null,
      metadata: metadata || null,
      created_at: new Date().toISOString()
    };

    const list = await readTransfers();
    list.push(transfer);
    await writeTransfers(list);

    return res.json({ success: true, transfer });
  } catch (err) {
    console.error('Error creating transfer:', err);
    return res.status(500).json({ error: 'No se pudo crear la transferencia' });
  }
};

exports.listTransfers = async (req, res) => {
  try {
    const list = await readTransfers();
    res.json({ transfers: list });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo leer el log de transferencias' });
  }
};
