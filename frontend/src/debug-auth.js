// Script de diagnóstico para autenticación
console.log('🔍 Diagnóstico de autenticación...\n');

// Verificar localStorage
console.log('📋 Contenido del localStorage:');
console.log('authToken:', localStorage.getItem('authToken'));
console.log('isAuthenticated:', localStorage.getItem('isAuthenticated'));
console.log('user:', localStorage.getItem('user'));

// Verificar si hay tokens corruptos
const token = localStorage.getItem('authToken');
if (token) {
  console.log('\n🔍 Análisis del token:');
  console.log('Longitud:', token.length);
  console.log('Primeros 50 caracteres:', token.substring(0, 50));
  console.log('Últimos 50 caracteres:', token.substring(token.length - 50));
  
  // Verificar formato JWT
  const parts = token.split('.');
  console.log('Partes del JWT:', parts.length);
  
  if (parts.length === 3) {
    try {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      console.log('Header:', header);
      console.log('Payload:', payload);
    } catch (error) {
      console.log('❌ Error decodificando JWT:', error.message);
    }
  } else {
    console.log('❌ Token no tiene formato JWT válido');
  }
} else {
  console.log('❌ No hay token en localStorage');
}

// Función para limpiar todo
window.clearAllAuth = () => {
  console.log('🧹 Limpiando toda la autenticación...');
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Autenticación limpiada');
};

console.log('\n💡 Para limpiar toda la autenticación, ejecuta: clearAllAuth()');
