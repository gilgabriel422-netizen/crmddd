const axios = require('axios');

async function testReportesAPI() {
  try {
    // Token válido del admin
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBjcm0uY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcwMzM0NTkwLCJleHAiOjE3NzAzNjMzOTB9.pjTqpO0RSnHcaJZbYbV1EqUGP7DCLM0igLp0OA3PZwQ';
    
    console.log('🧪 Haciendo test a /api/reportes/summary...\n');
    
    const response = await axios.get('http://localhost:5000/api/reportes/summary', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    
    console.log('✅ RESPUESTA DE LA API:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
  }
}

testReportesAPI();
