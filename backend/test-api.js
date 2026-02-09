const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBjcm0uY29tIiwicm9sZSI6ImFkbWluIiwicm93IjoiYWRtaW4iLCJpYXQiOjE3MzAzMjIwMDEsImV4cCI6MTczMDM1MDgwMX0.OcM3PIzoYKokJ4ZrmXGYz60b2ioLEJmjN3s0O6uet2g';

async function testAPI() {
  try {
    console.log('Testing /api/reportes/summary endpoint...\n');
    
    const response = await axios.get('http://localhost:5000/api/reportes/summary', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Respuesta del servidor:');
    console.log(JSON.stringify(response.data, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();
