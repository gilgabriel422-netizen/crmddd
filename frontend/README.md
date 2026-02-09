# Kempery World Travel - Landing Page

Una landing page moderna y responsiva para Kempery World Travel, empresa de turismo especializada en paquetes nacionales e internacionales.

## 🚀 Características

- **Diseño 100% responsivo** - Mobile-first approach
- **TailwindCSS v3** - Framework de CSS moderno y eficiente
- **React 18** - Biblioteca de JavaScript para interfaces de usuario
- **Componentes modulares** - Código organizado y reutilizable
- **Integración con WhatsApp** - Formularios que se envían directamente a WhatsApp
- **Animaciones sutiles** - Efectos de entrada y hover elegantes
- **SEO optimizado** - Meta tags y estructura semántica

## 🎨 Secciones de la Landing Page

### 1. **Hero Section**

- Imagen de fondo llamativa de destinos turísticos
- Título principal con llamada a la acción
- Botón CTA que abre WhatsApp
- Indicador de scroll animado

### 2. **Paquetes Turísticos**

- Grid responsivo de paquetes disponibles
- Cada tarjeta incluye imagen, descripción, precio y botón de acción
- Categorización por tipo (Nacional/Internacional)
- Sistema de calificaciones con estrellas

### 3. **Testimonios de Clientes**

- Carrusel automático de testimonios
- Navegación manual con flechas y puntos
- Información del cliente y paquete contratado
- Estadísticas de la empresa

### 4. **Formulario de Contacto**

- Formulario completo con validación
- Campos para información personal y detalles del viaje
- Envío directo a WhatsApp con mensaje preformateado
- Información de contacto y beneficios de la empresa

### 5. **Footer**

- Información completa de la empresa
- Enlaces rápidos a secciones
- Redes sociales con botones interactivos
- Información legal y de contacto

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS v3
- **Iconos**: Lucide React
- **Imágenes**: Unsplash (placeholders)
- **Responsive**: Mobile-first design
- **Animaciones**: CSS animations + Tailwind

## 📱 Diseño Responsivo

La landing page está diseñada siguiendo el enfoque mobile-first:

- **Mobile**: 1 columna, navegación hamburguesa
- **Tablet**: 2 columnas, navegación expandida
- **Desktop**: 3+ columnas, navegación completa

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 16+
- npm o yarn
- Backend corriendo en `http://localhost:5000` (si usas modo conectado). El backend del proyecto está en la carpeta `backend/` en la raíz del repo.

### 1. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

- `VITE_API_URL=http://localhost:5000/api` — URL del backend.
- `VITE_OFFLINE_MODE=false` — usar backend real; `true` para mocks locales.

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

### Modo offline vs modo conectado

- **VITE_OFFLINE_MODE=false** (por defecto en `.env.local.example`): el frontend consume el backend real en `VITE_API_URL`. El backend debe estar corriendo.
- **VITE_OFFLINE_MODE=true**: el frontend usa mocks en `src/services/api.js`; no requiere backend. Útil para desarrollo de UI sin API.

### 4. Construir para producción

```bash
npm run build
```

### 5. Previsualizar build de producción

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes de React
│   ├── Navbar.jsx      # Navegación principal
│   ├── Hero.jsx        # Sección hero
│   ├── Packages.jsx    # Paquetes turísticos
│   ├── Testimonials.jsx # Testimonios de clientes
│   ├── ContactForm.jsx # Formulario de contacto
│   └── Footer.jsx      # Pie de página
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales y Tailwind
```

## 🎯 Personalización

### Colores

Los colores principales están definidos en `tailwind.config.js`:

- **Navy**: `#1e3a8a` (Azul marino)
- **Light Blue**: `#3b82f6` (Azul claro)
- **Accent**: `#60a5fa` (Azul acento)

### Imágenes

Las imágenes actuales son placeholders de Unsplash. Para personalizar:

1. Reemplaza las URLs en los componentes
2. Asegúrate de que las imágenes tengan buena calidad
3. Optimiza las imágenes para web

### Contenido

- Edita el texto en cada componente según tus necesidades
- Modifica los paquetes turísticos en `Packages.jsx`
- Actualiza los testimonios en `Testimonials.jsx`
- Cambia la información de contacto en `ContactForm.jsx` y `Footer.jsx`

## 📞 Integración con WhatsApp

La landing page incluye integración completa con WhatsApp:

- **Número**: +593 99 922 2210
- **Formulario**: Se envía directamente a WhatsApp con mensaje preformateado
- **Botones CTA**: Todos abren WhatsApp con mensajes personalizados
- **Mensajes**: Incluyen información del formulario y solicitud de cotización

## 🌟 Características Destacadas

- **Performance**: Código optimizado y lazy loading
- **Accesibilidad**: ARIA labels y navegación por teclado
- **SEO**: Meta tags, estructura semántica y contenido optimizado
- **UX**: Navegación intuitiva y feedback visual
- **Mantenibilidad**: Código limpio y bien documentado

## 📊 Métricas y Analytics

La landing page incluye:

- Contadores de clientes satisfechos
- Calificación promedio de la empresa
- Número de destinos disponibles
- Estadísticas de éxito

## 🔧 Configuración Adicional

### Variables de Entorno

Crea un archivo `.env` para configuraciones:

```env
VITE_WHATSAPP_NUMBER=593999222210
VITE_COMPANY_EMAIL=info@kemperytravel.com
VITE_COMPANY_PHONE=+593 99 922 2210
```

### Redes Sociales

Actualiza los enlaces en `Footer.jsx`:

- Facebook: `https://facebook.com/kemperytravel`
- Instagram: `https://instagram.com/kemperytravel`
- Sitio Web: `https://kemperytravel.com`

## 🚀 Despliegue

### Netlify

1. Conecta tu repositorio
2. Build command: `npm run build`
3. Publish directory: `dist`

### Vercel

1. Importa tu proyecto
2. Framework preset: Vite
3. Build command: `npm run build`

### GitHub Pages

1. Configura GitHub Actions
2. Build y deploy automático
3. Publish directory: `dist`

## 📞 Soporte

Para soporte técnico o personalizaciones:

- **Email**: info@kemperytravel.com
- **WhatsApp**: +593 99 922 2210

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para Kempery World Travel**
