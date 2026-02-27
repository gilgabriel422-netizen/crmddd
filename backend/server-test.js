const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando sin BD' });
});

app.post('/api/contratos/plantilla', (req, res) => {
  console.log('POST /api/contratos/plantilla recibido');
  console.log('Body:', req.body);
  
  res.json({
    success: true,
    message: 'Contrato recibido (test)',
    data: {
      id: 1,
      numero_contrato: 'TEST-001'
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor de test corriendo en puerto ${PORT}`);
});
