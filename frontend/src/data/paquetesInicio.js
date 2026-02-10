export const paquetesInicio = [
  { id: 1, name: "Río de Janeiro - Búzios", description: "Disfruta de las playas paradisíacas de Búzios y la vibrante vida nocturna de Río de Janeiro.", image: "/images/paquetes/RioBuzios.jpeg", price: "Desde $1,299", duration: "7 días / 6 noches", group: "2-8 personas", rating: 4.9, type: "Internacional" },
  { id: 2, name: "Panamá - Medellín", description: "Explora la modernidad de Panamá y la cultura paisa de Medellín.", image: "/images/paquetes/PanamaMedellin.jpeg", price: "Desde $899", duration: "6 días / 5 noches", group: "2-6 personas", rating: 4.8, type: "Internacional" },
  { id: 3, name: "Bogotá Clásico", description: "Descubre la capital colombiana con su rica historia y gastronomía.", image: "/images/paquetes/BogotaClasico.jpeg", price: "Desde $699", duration: "4 días / 3 noches", group: "2-10 personas", rating: 4.7, type: "Internacional" },
  { id: 4, name: "Esencias de Grecia", description: "Sumérgete en la cuna de la civilización occidental.", image: "/images/paquetes/EsenciasGrecia.jpeg", price: "Desde $2,199", duration: "10 días / 9 noches", group: "2-12 personas", rating: 4.9, type: "Internacional" },
  { id: 5, name: "Panamá - Isla Mamey", description: "Relájate en las paradisíacas playas de Isla Mamey.", image: "/images/paquetes/PanamaIslaMamey.jpeg", price: "Desde $1,199", duration: "5 días / 4 noches", group: "2-8 personas", rating: 4.8, type: "Internacional" },
  { id: 6, name: "Joyas del Este - Nueva York", description: "Experimenta la Gran Manzana.", image: "/images/paquetes/JoyasEsteNewYork.jpeg", price: "Desde $1,899", duration: "6 días / 5 noches", group: "2-15 personas", rating: 4.9, type: "Internacional" },
  { id: 7, name: "Galápagos - Santa Cruz", description: "Explora las islas encantadas.", image: "/images/paquetes/GalapagosSantaCruz.jpeg", price: "Desde $1,499", duration: "5 días / 4 noches", group: "2-8 personas", rating: 4.9, type: "Nacional" },
  { id: 8, name: "India - Triángulo de Oro", description: "Descubre Delhi, Jaipur y Agra.", image: "/images/paquetes/DelhiJaipurAmberAbhaneriAgra.jpeg", price: "Desde $1,799", duration: "8 días / 7 noches", group: "2-12 personas", rating: 4.8, type: "Internacional" },
  { id: 9, name: "Estéreo Picnic", description: "Vive el festival de música más importante de Colombia.", image: "/images/paquetes/EstereoPicnic.jpeg", price: "Desde $599", duration: "3 días / 2 noches", group: "2-6 personas", rating: 4.6, type: "Internacional" },
  { id: 10, name: "India - Triángulo de Oro", description: "Recorre los destinos más emblemáticos de la India.", image: "/images/paquetes/IndiaTrianguloOro.jpeg", price: "Desde $1,699", duration: "9 días / 8 noches", group: "2-10 personas", rating: 4.8, type: "Internacional" },
  { id: 11, name: "Lima - Huacachina", description: "Descubre la capital gastronómica y el oasis.", image: "/images/paquetes/LimaHuacachina.jpeg", price: "Desde $799", duration: "5 días / 4 noches", group: "2-8 personas", rating: 4.7, type: "Internacional" },
  { id: 12, name: "Guatapé", description: "Explora el pueblo más colorido de Colombia.", image: "/images/paquetes/Guatape.jpeg", price: "Desde $399", duration: "2 días / 1 noche", group: "2-6 personas", rating: 4.5, type: "Internacional" },
  { id: 13, name: "San Andrés - Carnaval", description: "Disfruta del carnaval en San Andrés.", image: "/images/paquetes/SanAndresCarnaval.jpeg", price: "Desde $899", duration: "4 días / 3 noches", group: "2-8 personas", rating: 4.8, type: "Internacional" },
  { id: 14, name: "Bogotá Clásico", description: "Experiencia completa de la capital colombiana.", image: "/images/paquetes/BogotaClasic.jpeg", price: "Desde $699", duration: "4 días / 3 noches", group: "2-10 personas", rating: 4.7, type: "Internacional" },
  { id: 15, name: "Panamá Navideño", description: "Vive la magia de la Navidad en Panamá.", image: "/images/paquetes/PanamaNavideno.jpeg", price: "Desde $1,099", duration: "5 días / 4 noches", group: "2-8 personas", rating: 4.8, type: "Internacional" },
  { id: 16, name: "Cali Salsero", description: "Sumérgete en la capital mundial de la salsa.", image: "/images/paquetes/CaliSalsero.jpeg", price: "Desde $599", duration: "3 días / 2 noches", group: "2-6 personas", rating: 4.6, type: "Internacional" },
  { id: 17, name: "Santander Máximo", description: "Explora los paisajes de Santander.", image: "/images/paquetes/SantanderMaximo.jpeg", price: "Desde $799", duration: "4 días / 3 noches", group: "2-8 personas", rating: 4.7, type: "Internacional" },
  { id: 18, name: "Turquía - Bursa & Egipto", description: "Descubre Turquía y Egipto.", image: "/images/paquetes/TurquiaBursaEgipto.jpeg", price: "Desde $2,499", duration: "12 días / 11 noches", group: "2-15 personas", rating: 4.9, type: "Internacional" }
];

const WHATSAPP_NUMERO = '593999222210';
const MSJ_MAS_INFO = 'Me podrían ayudar con más información de este paquete.';

export function openWhatsAppMasInfo(packageName) {
  const text = packageName ? `${MSJ_MAS_INFO} (${packageName})` : MSJ_MAS_INFO;
  window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(text)}`, '_blank');
}
